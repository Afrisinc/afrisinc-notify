import { useState } from "react";
import { useParams } from "react-router-dom";
import { useContacts, useCreateContact, useImportContacts } from "@/hooks/useContacts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Upload, Users, UserPlus, ClipboardPaste, FileUp, Check, AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SearchInput } from "@/components/ui/search-input";

export default function AppContacts() {
  const { appId } = useParams<{ appId: string }>();
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [showImport, setShowImport] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [importStep, setImportStep] = useState<"select" | "progress" | "done">("select");
  const [newContactData, setNewContactData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    tags: "",
  });
  const [importError, setImportError] = useState<string | null>(null);

  // Fetch contacts
  const { data: contactsResponse, isLoading, error: fetchError } = useContacts(appId || "", { page: 1, limit: 100 });
  const contacts = contactsResponse?.contacts || [];

  // Mutations
  const createContactMutation = useCreateContact();
  const importContactsMutation = useImportContacts();

  const allTags = [...new Set(contacts.flatMap((c) => c.tags))];

  const filtered = contacts.filter((c) => {
    const matchSearch =
      `${c.firstName || ""} ${c.lastName || ""} ${c.email}`.toLowerCase().includes(search.toLowerCase());
    const matchTag = tagFilter === "all" || c.tags.includes(tagFilter);
    return matchSearch && matchTag;
  });

  const handleCreateContact = async () => {
    if (!appId || !newContactData.email) return;

    try {
      await createContactMutation.mutateAsync({
        appId,
        payload: {
          email: newContactData.email,
          firstName: newContactData.firstName || undefined,
          lastName: newContactData.lastName || undefined,
          phone: newContactData.phone || undefined,
          tags: newContactData.tags ? newContactData.tags.split(",").map((t) => t.trim()) : [],
        },
      });
      setNewContactData({ firstName: "", lastName: "", email: "", phone: "", tags: "" });
      setShowAdd(false);
    } catch (err) {
      setImportError((err as Error).message);
    }
  };

  const handleImport = async () => {
    if (!appId) return;

    setImportStep("progress");
    setImportError(null);
    try {
      await importContactsMutation.mutateAsync({
        appId,
        payload: {
          contacts: [{ email: "temp@example.com" }], // Placeholder - would be actual CSV data
        },
      });
      setImportStep("done");
    } catch (err) {
      setImportError((err as Error).message);
      setImportStep("select");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-64" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-20" />
          <Skeleton className="h-20" />
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Failed to load contacts. Please try again.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      {/* Error Alert */}
      {importError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{importError}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search contacts..."
            size="sm"
            className="flex-1 max-w-sm"
          />
          <Select value={tagFilter} onValueChange={setTagFilter}>
            <SelectTrigger className="w-[130px]"><SelectValue placeholder="Tag" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowImport(true)}>
            <Upload className="h-3.5 w-3.5 mr-1.5" /> Import
          </Button>
          <Button size="sm" onClick={() => setShowAdd(true)}>
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Contact
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-3">
        <Card className="border-border/60 flex-1">
          <CardContent className="p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <div><p className="text-2xl font-bold text-content">{contacts.length}</p><p className="text-xs text-content-secondary">Total Contacts</p></div>
          </CardContent>
        </Card>
        <Card className="border-border/60 flex-1">
          <CardContent className="p-4 flex items-center gap-3">
            <Badge variant="secondary" className="text-xs">{allTags.length} tags</Badge>
            <div className="flex gap-1 flex-wrap">{allTags.map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-border/60">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead className="hidden md:table-cell">Phone</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead className="hidden sm:table-cell">Added</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-12 text-content-secondary">No contacts found</TableCell></TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.firstName || ""} {c.lastName || ""}</TableCell>
                  <TableCell className="text-content-secondary">{c.email}</TableCell>
                  <TableCell className="text-content-secondary hidden md:table-cell">{c.phone || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">{c.tags.map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}</div>
                  </TableCell>
                  <TableCell className="text-content-secondary text-xs hidden sm:table-cell">{new Date(c.createdAt).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Import Dialog */}
      <Dialog open={showImport} onOpenChange={(open) => { setShowImport(open); if (!open) setImportStep("select"); }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Import Contacts</DialogTitle>
            <DialogDescription>Add recipients to this app using one of the methods below.</DialogDescription>
          </DialogHeader>
          {importStep === "select" && (
            <Tabs defaultValue="csv">
              <TabsList className="w-full">
                <TabsTrigger value="csv" className="flex-1"><FileUp className="h-3.5 w-3.5 mr-1" /> CSV Upload</TabsTrigger>
                <TabsTrigger value="paste" className="flex-1"><ClipboardPaste className="h-3.5 w-3.5 mr-1" /> Paste List</TabsTrigger>
                <TabsTrigger value="manual" className="flex-1"><UserPlus className="h-3.5 w-3.5 mr-1" /> Manual</TabsTrigger>
              </TabsList>
              <TabsContent value="csv" className="space-y-3 mt-4">
                <p className="text-xs text-muted-foreground">Upload a CSV file with columns: name, email, phone</p>
                <div className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors">
                  <FileUp className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Drop CSV here or click to upload</p>
                </div>
                <Button className="w-full" onClick={handleImport}>Import CSV</Button>
              </TabsContent>
              <TabsContent value="paste" className="space-y-3 mt-4">
                <p className="text-xs text-muted-foreground">Paste email addresses, one per line</p>
                <Textarea placeholder={"alice@example.com\nbob@example.com\ncarol@example.com"} rows={6} />
                <Button className="w-full" onClick={handleImport}>Import Emails</Button>
              </TabsContent>
              <TabsContent value="manual" className="space-y-3 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>First Name</Label><Input placeholder="Alice" /></div>
                  <div><Label>Last Name</Label><Input placeholder="Williams" /></div>
                </div>
                <div><Label>Email</Label><Input placeholder="alice@example.com" /></div>
                <div><Label>Phone</Label><Input placeholder="+1234567890" /></div>
                <div><Label>Tags (comma-separated)</Label><Input placeholder="vip, newsletter" /></div>
                <Button className="w-full" onClick={handleImport}>Add Contact</Button>
              </TabsContent>
            </Tabs>
          )}
          {importStep === "progress" && (
            <div className="py-12 text-center">
              <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">Importing contacts...</p>
            </div>
          )}
          {importStep === "done" && (
            <div className="py-12 text-center">
              <div className="h-12 w-12 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
                <Check className="h-6 w-6 text-success" />
              </div>
              <p className="text-sm font-medium text-foreground">Import Complete</p>
              <p className="text-xs text-muted-foreground mt-1">Contacts have been added to the app.</p>
              <Button className="mt-4" onClick={() => { setShowImport(false); setImportStep("select"); }}>Done</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Contact Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Add Contact</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First Name</Label>
                <Input
                  placeholder="Alice"
                  value={newContactData.firstName}
                  onChange={(e) => setNewContactData({ ...newContactData, firstName: e.target.value })}
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  placeholder="Williams"
                  value={newContactData.lastName}
                  onChange={(e) => setNewContactData({ ...newContactData, lastName: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                placeholder="alice@example.com"
                type="email"
                value={newContactData.email}
                onChange={(e) => setNewContactData({ ...newContactData, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                placeholder="+1234567890"
                value={newContactData.phone}
                onChange={(e) => setNewContactData({ ...newContactData, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                placeholder="vip, newsletter"
                value={newContactData.tags}
                onChange={(e) => setNewContactData({ ...newContactData, tags: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button
              onClick={handleCreateContact}
              disabled={!newContactData.email || createContactMutation.isPending}
            >
              {createContactMutation.isPending ? "Adding..." : "Add Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

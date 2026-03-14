import { useState } from "react";
import { useParams } from "react-router-dom";
import { contacts as allContacts } from "@/data/mockData";
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
import { Plus, Search, Upload, Users, UserPlus, ClipboardPaste, FileUp, Check } from "lucide-react";

export default function AppContacts() {
  const { appId } = useParams();
  const contacts = allContacts.filter((c) => c.appId === appId);
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [showImport, setShowImport] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [importStep, setImportStep] = useState<"select" | "progress" | "done">("select");

  const allTags = [...new Set(contacts.flatMap((c) => c.tags))];

  const filtered = contacts.filter((c) => {
    const matchSearch =
      `${c.firstName} ${c.lastName} ${c.email}`.toLowerCase().includes(search.toLowerCase());
    const matchTag = tagFilter === "all" || c.tags.includes(tagFilter);
    return matchSearch && matchTag;
  });

  const handleImport = () => {
    setImportStep("progress");
    setTimeout(() => setImportStep("done"), 1500);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search contacts..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
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
            <div><p className="text-2xl font-bold text-foreground">{contacts.length}</p><p className="text-xs text-muted-foreground">Total Contacts</p></div>
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
              <TableRow><TableCell colSpan={5} className="text-center py-12 text-muted-foreground">No contacts found</TableCell></TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.firstName} {c.lastName}</TableCell>
                  <TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell className="text-muted-foreground hidden md:table-cell">{c.phone || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">{c.tags.map((t) => <Badge key={t} variant="outline" className="text-[10px]">{t}</Badge>)}</div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs hidden sm:table-cell">{c.createdAt}</TableCell>
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
              <div><Label>First Name</Label><Input placeholder="Alice" /></div>
              <div><Label>Last Name</Label><Input placeholder="Williams" /></div>
            </div>
            <div><Label>Email</Label><Input placeholder="alice@example.com" /></div>
            <div><Label>Phone</Label><Input placeholder="+1234567890" /></div>
            <div><Label>Tags (comma-separated)</Label><Input placeholder="vip, newsletter" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={() => setShowAdd(false)}>Add Contact</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

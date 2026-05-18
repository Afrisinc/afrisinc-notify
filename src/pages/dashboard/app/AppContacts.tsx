import { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  useContacts,
  useCreateContact,
  useImportContacts,
  useUpdateContact,
  useDeleteContact,
} from "@/hooks/useContacts";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Upload,
  Users,
  UserPlus,
  ClipboardPaste,
  FileUp,
  Check,
  AlertCircle,
  Download,
  Pencil,
  Trash2,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SearchInput } from "@/components/ui/search-input";

type LocalContact = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tags?: string[];
};

export default function AppContacts() {
  const { appId } = useParams<{ appId: string }>();
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("all");
  const [showImport, setShowImport] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [importStep, setImportStep] = useState<"select" | "preview" | "progress" | "done">(
    "select",
  );
  const [parsedContacts, setParsedContacts] = useState<LocalContact[]>([]);
  const [importResults, setImportResults] = useState<{
    imported: number;
    updated: number;
    skipped: number;
    failed: number;
    errors: Array<{ row: number; email: string; reason: string }>;
  } | null>(null);
  const [newContactData, setNewContactData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    tags: "",
  });
  const [importError, setImportError] = useState<string | null>(null);
  const [pasteContent, setPasteContent] = useState("");
  const [manualContactData, setManualContactData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    tags: "",
  });
  const [editingContact, setEditingContact] = useState<any>(null);
  const [contactToDelete, setContactToDelete] = useState<string | null>(null);

  const csvInputRef = useRef<HTMLInputElement | null>(null);

  // Fetch contacts
  const {
    data: contactsResponse,
    isLoading,
    error: fetchError,
  } = useContacts(appId || "", { page: 1, limit: 100 });
  const contacts = contactsResponse?.contacts || [];

  // Mutations
  const createContactMutation = useCreateContact();
  const importContactsMutation = useImportContacts();
  const updateContactMutation = useUpdateContact();
  const deleteContactMutation = useDeleteContact();

  const allTags = [...new Set(contacts.flatMap((c) => c.tags))];

  const filtered = contacts.filter((c) => {
    const matchSearch = `${c.firstName || ""} ${c.lastName || ""} ${c.email}`
      .toLowerCase()
      .includes(search.toLowerCase());
    const matchTag = tagFilter === "all" || c.tags.includes(tagFilter);
    return matchSearch && matchTag;
  });

  const handleDownloadSampleCsv = () => {
    const sampleCsv = [
      "firstName,lastName,email,phone,tags",
      'Alice,Williams,alice@example.com,+1234567890,"vip, newsletter"',
      'John,Doe,john@example.com,,"trial"',
    ].join("\n");

    const blob = new Blob([sampleCsv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "contacts-sample.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const parseCsv = (text: string) => {
    const rows: string[][] = [];
    let cur = "";
    let row: string[] = [];
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '"') {
        if (inQuotes && text[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        row.push(cur);
        cur = "";
      } else if ((ch === '\n' || ch === '\r') && !inQuotes) {
        // handle CRLF or LF
        if (ch === '\r' && text[i + 1] === '\n') {
          // skip, will be handled by \n
        }
        row.push(cur);
        cur = "";
        // only push non-empty rows (ignore stray empty final row)
        if (row.length !== 1 || row[0] !== "") rows.push(row);
        row = [];
      } else {
        cur += ch;
      }
    }

    // push last field/row
    if (cur !== "" || row.length > 0) {
      row.push(cur);
      rows.push(row);
    }

    // trim fields
    return rows.map((r) => r.map((f) => f.trim()));
  };

  const handleFileUpload = async (file: File) => {
    if (!appId) {
      setImportError("Missing app id");
      return;
    }

    setImportStep("progress");
    setImportError(null);

    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length < 1) throw new Error("CSV file is empty");

      const header = rows[0].map((h) => h.toLowerCase());
      const idx = {
        firstName: header.indexOf("firstname"),
        lastName: header.indexOf("lastname"),
        email: header.indexOf("email"),
        phone: header.indexOf("phone"),
        tags: header.indexOf("tags"),
      };

      const dataRows = rows.slice(1);

      const contactsPayload: LocalContact[] = dataRows
        .map((r) => {
          const email = (r[idx.email] || "").trim();
          if (!email) return null;
          const tagsRaw = r[idx.tags] || "";
          const tags = tagsRaw
            .split(",")
            .map((t) => t.trim())
            .filter(Boolean);

          return {
            email,
            firstName: (r[idx.firstName] || "") || undefined,
            lastName: (r[idx.lastName] || "") || undefined,
            phone: (r[idx.phone] || "") || undefined,
            tags,
          } as LocalContact;
        })
        .filter((c): c is LocalContact => c !== null);

      if (contactsPayload.length === 0) throw new Error("No valid contacts found in CSV");

      setParsedContacts(contactsPayload);
      setImportStep("preview");
    } catch (err) {
      setImportError((err as Error).message);
      setImportStep("select");
    }
  };

  const confirmImport = async () => {
    if (!appId) return;

    setImportStep("progress");
    setImportError(null);
    try {
      const result = await importContactsMutation.mutateAsync({
        appId,
        payload: { contacts: parsedContacts },
      });
      setImportResults(result);
      setImportStep("done");
    } catch (err) {
      setImportError((err as Error).message);
      setImportStep("preview");
    }
  };

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
          tags: newContactData.tags
            ? newContactData.tags.split(",").map((t) => t.trim())
            : [],
        },
      });
      setNewContactData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        tags: "",
      });
      setShowAdd(false);
    } catch (err) {
      setImportError((err as Error).message);
    }
  };

  const handleUpdateContact = async () => {
    if (!appId || !editingContact || !editingContact.email) return;

    try {
      await updateContactMutation.mutateAsync({
        appId,
        contactId: editingContact.id,
        payload: {
          email: editingContact.email,
          firstName: editingContact.firstName || undefined,
          lastName: editingContact.lastName || undefined,
          phone: editingContact.phone || undefined,
          tags: Array.isArray(editingContact.tags)
            ? editingContact.tags
            : (editingContact.tags as string).split(",").map((t) => t.trim()).filter(Boolean),
        },
      });
      setEditingContact(null);
    } catch (err) {
      setImportError((err as Error).message);
    }
  };

  const handleDeleteContact = async () => {
    if (!appId || !contactToDelete) return;
    try {
      await deleteContactMutation.mutateAsync({ appId, contactId: contactToDelete });
      setContactToDelete(null);
    } catch (err) {
      setImportError((err as Error).message);
    }
  };

  const handlePasteImport = () => {
    if (!appId) return;
    setImportError(null);
    const emails = pasteContent
      .split('\n')
      .map(e => e.trim())
      .filter(Boolean);

    if (emails.length === 0) {
      setImportError("No emails provided");
      return;
    }

    const payload: LocalContact[] = emails.map(email => ({ email }));
    setParsedContacts(payload);
    setImportStep("preview");
  };

  const handleManualImport = () => {
    if (!appId) return;
    setImportError(null);
    if (!manualContactData.email.trim()) {
      setImportError("Email is required");
      return;
    }

    const tags = manualContactData.tags
      .split(",")
      .map(t => t.trim())
      .filter(Boolean);

    const payload: LocalContact[] = [{
      email: manualContactData.email.trim(),
      firstName: manualContactData.firstName.trim() || undefined,
      lastName: manualContactData.lastName.trim() || undefined,
      phone: manualContactData.phone.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    }];
    setParsedContacts(payload);
    setImportStep("preview");
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
        <AlertDescription>
          Failed to load contacts. Please try again.
        </AlertDescription>
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
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Tag" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tags</SelectItem>
              {allTags.map((t) => (
                <SelectItem key={t} value={t}>
                  {t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowImport(true)}
          >
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
            <div>
              <p className="text-2xl font-bold text-content">
                {contacts.length}
              </p>
              <p className="text-xs text-content-secondary">Total Contacts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-border/60 flex-1">
          <CardContent className="p-4 flex items-center gap-3">
            <Badge variant="secondary" className="text-xs">
              {allTags.length} tags
            </Badge>
            <div className="flex gap-1 flex-wrap">
              {allTags.map((t) => (
                <Badge key={t} variant="outline" className="text-[10px]">
                  {t}
                </Badge>
              ))}
            </div>
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
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-12 text-content-secondary"
                >
                  No contacts found
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">
                    {c.firstName || ""} {c.lastName || ""}
                  </TableCell>
                  <TableCell className="text-content-secondary">
                    {c.email}
                  </TableCell>
                  <TableCell className="text-content-secondary hidden md:table-cell">
                    {c.phone || "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 flex-wrap">
                      {c.tags.map((t) => (
                        <Badge
                          key={t}
                          variant="outline"
                          className="text-[10px]"
                        >
                          {t}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-content-secondary text-xs hidden sm:table-cell">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8" 
                        onClick={() => setEditingContact({
                          ...c,
                          tags: c.tags?.join(", ") || ""
                        })}
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10" 
                        onClick={() => setContactToDelete(c.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Import Dialog */}
      <Dialog
        open={showImport}
        onOpenChange={(open) => {
          setShowImport(open);
          if (!open) {
            setImportStep("select");
            setParsedContacts([]);
            setImportResults(null);
            setPasteContent("");
            setManualContactData({
              firstName: "",
              lastName: "",
              email: "",
              phone: "",
              tags: "",
            });
            setImportError(null);
          }
        }}
      >
        <DialogContent className={importStep === "preview" ? "sm:max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto" : "sm:max-w-lg"}>
          <DialogHeader>
            <DialogTitle>Import Contacts</DialogTitle>
            <DialogDescription>
              Add recipients to this app using one of the methods below.
            </DialogDescription>
          </DialogHeader>
          {importStep === "select" && (
            <Tabs defaultValue="csv">
              <div className="mb-3 flex flex-col gap-2 rounded-lg border border-border/60 bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Need a template?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Download a sample CSV and fill it with your contacts before
                    uploading.
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSampleCsv}
                >
                  <Download className="h-3.5 w-3.5 mr-1.5" /> Download sample
                </Button>
              </div>
              <TabsList className="w-full">
                <TabsTrigger value="csv" className="flex-1">
                  <FileUp className="h-3.5 w-3.5 mr-1" /> CSV Upload
                </TabsTrigger>
                <TabsTrigger value="paste" className="flex-1">
                  <ClipboardPaste className="h-3.5 w-3.5 mr-1" /> Paste List
                </TabsTrigger>
                <TabsTrigger value="manual" className="flex-1">
                  <UserPlus className="h-3.5 w-3.5 mr-1" /> Manual
                </TabsTrigger>
              </TabsList>
              <TabsContent value="csv" className="space-y-3 mt-4">
                <p className="text-xs text-muted-foreground">
                  Upload a CSV file with columns: firstName, lastName, email,
                  phone, tags
                </p>
                
                <div
                  id="csv-drop-area"
                  onClick={() => document.getElementById("csv-input")?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async (e) => {
                    e.preventDefault();
                    const file = e.dataTransfer?.files?.[0];
                    if (file) await handleFileUpload(file);
                  }}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <FileUp className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Drop CSV here or click to upload
                  </p>
                  <input
                    id="csv-input"
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    ref={csvInputRef}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) await handleFileUpload(file);
                      e.currentTarget.value = "";
                    }}
                  />
                </div>
                <Button
                  className="w-full"
                  onClick={() => document.getElementById("csv-input")?.click()}
                >
                  Import CSV
                </Button>
              </TabsContent>
              <TabsContent value="paste" className="space-y-3 mt-4">
                <p className="text-xs text-muted-foreground">
                  Paste email addresses, one per line
                </p>
                <Textarea
                  placeholder={
                    "alice@example.com\nbob@example.com\ncarol@example.com"
                  }
                  rows={6}
                  value={pasteContent}
                  onChange={(e) => setPasteContent(e.target.value)}
                />
                <Button className="w-full" onClick={handlePasteImport}>
                  Preview Import
                </Button>
              </TabsContent>
              <TabsContent value="manual" className="space-y-3 mt-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>First Name</Label>
                    <Input 
                      placeholder="Alice" 
                      value={manualContactData.firstName}
                      onChange={(e) => setManualContactData({ ...manualContactData, firstName: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Last Name</Label>
                    <Input 
                      placeholder="Williams" 
                      value={manualContactData.lastName}
                      onChange={(e) => setManualContactData({ ...manualContactData, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label>Email *</Label>
                  <Input 
                    placeholder="alice@example.com" 
                    value={manualContactData.email}
                    onChange={(e) => setManualContactData({ ...manualContactData, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Phone</Label>
                  <Input 
                    placeholder="+1234567890" 
                    value={manualContactData.phone}
                    onChange={(e) => setManualContactData({ ...manualContactData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Tags (comma-separated)</Label>
                  <Input 
                    placeholder="vip, newsletter" 
                    value={manualContactData.tags}
                    onChange={(e) => setManualContactData({ ...manualContactData, tags: e.target.value })}
                  />
                </div>
                <Button className="w-full" onClick={handleManualImport}>
                  Preview Import
                </Button>
              </TabsContent>
            </Tabs>
          )}
          {importStep === "preview" && (
            <div className="space-y-4 py-4">
              <Alert>
                <Check className="h-4 w-4" />
                <AlertDescription>
                  Found {parsedContacts.length} valid contacts to import.
                </AlertDescription>
              </Alert>
              <div className="max-h-[50vh] overflow-auto rounded-md border min-w-0">
                <Table className="whitespace-nowrap">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Tags</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {parsedContacts.slice(0, 100).map((c, i) => (
                      <TableRow key={i}>
                        <TableCell className="max-w-[200px] truncate" title={c.email}>{c.email}</TableCell>
                        <TableCell className="max-w-[150px] truncate" title={`${c.firstName || ''} ${c.lastName || ''}`.trim()}>
                          {c.firstName} {c.lastName}
                        </TableCell>
                        <TableCell>{c.phone}</TableCell>
                        <TableCell className="max-w-[200px] truncate w-full" title={c.tags?.join(", ")}>
                          {c.tags?.length ? (
                            <div className="flex gap-1 flex-wrap">
                              {c.tags.map((t) => (
                                <Badge key={`${i}-${t}`} variant="outline" className="text-[10px]">
                                  {t}
                                </Badge>
                              ))}
                            </div>
                          ) : "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                    {parsedContacts.length > 100 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground p-4">
                          And {parsedContacts.length - 100} more...
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setImportStep("select")}>
                  Back
                </Button>
                <Button onClick={confirmImport} disabled={importContactsMutation.isPending}>
                  {importContactsMutation.isPending ? "Importing..." : "Confirm Import"}
                </Button>
              </DialogFooter>
            </div>
          )}
          {importStep === "progress" && (
            <div className="py-12 text-center">
              <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Importing contacts...
              </p>
            </div>
          )}
          {importStep === "done" && (
            <div className="py-8 space-y-6">
              <div className="text-center">
                <div className={`h-12 w-12 rounded-full ${importResults?.failed > 0 ? "bg-warning/15" : "bg-success/15"} flex items-center justify-center mx-auto mb-4`}>
                  {importResults?.failed > 0 ? <AlertCircle className="h-6 w-6 text-warning" /> : <Check className="h-6 w-6 text-success" />}
                </div>
                <p className="text-lg font-medium text-foreground">
                  Import Complete
                </p>
                <div className="flex justify-center gap-4 mt-4 text-sm">
                  <div className="flex flex-col items-center"><span className="font-bold text-success">{importResults?.imported || 0}</span><span className="text-muted-foreground">Imported</span></div>
                  <div className="flex flex-col items-center"><span className="font-bold text-primary">{importResults?.updated || 0}</span><span className="text-muted-foreground">Updated</span></div>
                  <div className="flex flex-col items-center"><span className="font-bold text-warning">{importResults?.failed || 0}</span><span className="text-muted-foreground">Failed</span></div>
                </div>
              </div>

              {importResults?.errors && importResults.errors.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Failed Rows:</h4>
                  <div className="max-h-[200px] overflow-auto rounded-md border border-warning/20 bg-warning/5">
                    <Table>
                      <TableHeader>
                        <TableRow className="hover:bg-transparent border-warning/20">
                          <TableHead className="w-16">Row</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Reason</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importResults.errors.map((err: { row: number; email: string; reason: string }, i: number) => (
                          <TableRow key={i} className="hover:bg-warning/10 border-warning/20">
                            <TableCell>{err.row}</TableCell>
                            <TableCell>{err.email}</TableCell>
                            <TableCell className="text-warning font-medium">{err.reason}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                onClick={() => {
                  setShowImport(false);
                  setImportStep("select");
                  setParsedContacts([]);
                  setImportResults(null);
                }}
              >
                Done
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Contact Dialog */}
      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>First Name</Label>
                <Input
                  placeholder="Alice"
                  value={newContactData.firstName}
                  onChange={(e) =>
                    setNewContactData({
                      ...newContactData,
                      firstName: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Last Name</Label>
                <Input
                  placeholder="Williams"
                  value={newContactData.lastName}
                  onChange={(e) =>
                    setNewContactData({
                      ...newContactData,
                      lastName: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                placeholder="alice@example.com"
                type="email"
                value={newContactData.email}
                onChange={(e) =>
                  setNewContactData({
                    ...newContactData,
                    email: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Phone</Label>
              <Input
                placeholder="+1234567890"
                value={newContactData.phone}
                onChange={(e) =>
                  setNewContactData({
                    ...newContactData,
                    phone: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>Tags (comma-separated)</Label>
              <Input
                placeholder="vip, newsletter"
                value={newContactData.tags}
                onChange={(e) =>
                  setNewContactData({ ...newContactData, tags: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateContact}
              disabled={
                !newContactData.email || createContactMutation.isPending
              }
            >
              {createContactMutation.isPending ? "Adding..." : "Add Contact"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Contact Dialog */}
      <Dialog open={!!editingContact} onOpenChange={(open) => !open && setEditingContact(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>
          </DialogHeader>
          {editingContact && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>First Name</Label>
                  <Input
                    placeholder="Alice"
                    value={editingContact.firstName || ""}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        firstName: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <Label>Last Name</Label>
                  <Input
                    placeholder="Williams"
                    value={editingContact.lastName || ""}
                    onChange={(e) =>
                      setEditingContact({
                        ...editingContact,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  placeholder="alice@example.com"
                  type="email"
                  value={editingContact.email || ""}
                  onChange={(e) =>
                    setEditingContact({
                      ...editingContact,
                      email: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  placeholder="+1234567890"
                  value={editingContact.phone || ""}
                  onChange={(e) =>
                    setEditingContact({
                      ...editingContact,
                      phone: e.target.value,
                    })
                  }
                />
              </div>
              <div>
                <Label>Tags (comma-separated)</Label>
                <Input
                  placeholder="vip, newsletter"
                  value={editingContact.tags || ""}
                  onChange={(e) =>
                    setEditingContact({ ...editingContact, tags: e.target.value })
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingContact(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpdateContact}
              disabled={
                !editingContact?.email || updateContactMutation.isPending
              }
            >
              {updateContactMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!contactToDelete} onOpenChange={(open) => !open && setContactToDelete(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Contact</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this contact? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setContactToDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteContact}
              disabled={deleteContactMutation.isPending}
            >
              {deleteContactMutation.isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Search, Download, SlidersHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

import Admin from "@/layouts/Admin";

export default function ReportPage() {
  const handleFilter = (cat) => {
    console.log("Filter by:", cat);
  };

  // === Dummy employees ONLINE (50 data) ===
  const onlineEmployees = Array.from({ length: 50 }, (_, i) => ({
    name: `Online Employee ${i + 1}`,
    employeeid: `${50000 + i}`,
    position: i % 3 === 0 ? "Programmer" : i % 3 === 1 ? "Designer" : "Manager",
    department: i % 2 === 0 ? "ITD" : "HRD",
    company: i % 2 === 0 ? "PT PSG" : "PT RSUP",
    course:
      i % 4 === 0
        ? "Teknik Dasar Pengelasan"
        : i % 4 === 1
        ? "Teknik Dasar Pengeboran"
        : i % 4 === 2
        ? "Teknik Dasar Pencurian"
        : "Teknik Dasar Keamanan",
    status: i % 2 === 0 ? "Passed" : "Failed",
    score: `${Math.floor(Math.random() * 50) + 50}`,
    date: "21-11-2025",
    expire: "21-11-2026",
  }));

  // === Dummy employees OFFLINE (40 data) ===
  const offlineEmployees = Array.from({ length: 40 }, (_, i) => ({
    name: `Offline Employee ${i + 1}`,
    employeeid: `${60000 + i}`,
    position:
      i % 3 === 0 ? "Supervisor" : i % 3 === 1 ? "Technician" : "Operator",
    department: i % 2 === 0 ? "Finance" : "Marketing",
    company: i % 2 === 0 ? "PT BUMN" : "PT Swasta",
    trainingtitle:
      i % 3 === 0
        ? "Leadership Training"
        : i % 3 === 1
        ? "Communication Skills"
        : "Project Management",
    provider: i % 2 === 0 ? "KEMNAKER" : "KEMNAKER",
    certificateid: `CERT-${7000 + i}`,
    // status: i % 2 === 0 ? "Valid" : "Expired",
    date: "11-05-2025",
    expire: "11-05-2026",
  }));

  // === State ONLINE ===
  const [onlineSelected, setOnlineSelected] = useState([]);
  const [onlineSearch, setOnlineSearch] = useState("");
  const [onlinePage, setOnlinePage] = useState(1);
  const rowsPerPage = 10;

  const filteredOnline = onlineEmployees.filter((e) => {
    const term = onlineSearch.toLowerCase();
    return (
      e.name.toLowerCase().includes(term) ||
      e.employeeid.toLowerCase().includes(term) ||
      e.position.toLowerCase().includes(term) ||
      e.department.toLowerCase().includes(term) ||
      e.company.toLowerCase().includes(term) ||
      e.course.toLowerCase().includes(term) ||
      e.status.toLowerCase().includes(term)
    );
  });
  const totalOnlinePages = Math.ceil(filteredOnline.length / rowsPerPage);
  const startOnline = (onlinePage - 1) * rowsPerPage;
  const paginatedOnline = filteredOnline.slice(
    startOnline,
    startOnline + rowsPerPage
  );

  const toggleAllOnline = () => {
    if (onlineSelected.length === filteredOnline.length) {
      setOnlineSelected([]);
    } else {
      setOnlineSelected(filteredOnline.map((e) => e.employeeid));
    }
  };
  const toggleOneOnline = (id) => {
    setOnlineSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // === State OFFLINE ===
  const [offlineSelected, setOfflineSelected] = useState([]);
  const [offlineSearch, setOfflineSearch] = useState("");
  const [offlinePage, setOfflinePage] = useState(1);

  const filteredOffline = offlineEmployees.filter((e) => {
    const term = offlineSearch.toLowerCase();
    return (
      e.name.toLowerCase().includes(term) ||
      e.employeeid.toLowerCase().includes(term) ||
      e.position.toLowerCase().includes(term) ||
      e.department.toLowerCase().includes(term) ||
      e.company.toLowerCase().includes(term) ||
      e.trainingtitle.toLowerCase().includes(term) ||
      e.provider.toLowerCase().includes(term) ||
      e.certificateid.toLowerCase().includes(term) ||
      e.status.toLowerCase().includes(term)
    );
  });
  const totalOfflinePages = Math.ceil(filteredOffline.length / rowsPerPage);
  const startOffline = (offlinePage - 1) * rowsPerPage;
  const paginatedOffline = filteredOffline.slice(
    startOffline,
    startOffline + rowsPerPage
  );

  const toggleAllOffline = () => {
    if (offlineSelected.length === filteredOffline.length) {
      setOfflineSelected([]);
    } else {
      setOfflineSelected(filteredOffline.map((e) => e.employeeid));
    }
  };
  const toggleOneOffline = (id) => {
    setOfflineSelected((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="mt-5">
      <Card className="border border-black">
        <CardContent>
          <Tabs defaultValue="online" className="w-full mt-5">
            <TabsList>
              <TabsTrigger
                value="online"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-md"
              >
                Online Learning
              </TabsTrigger>
              <TabsTrigger
                value="offline"
                className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-md"
              >
                Offline Learning
              </TabsTrigger>
            </TabsList>

            {/* ONLINE TAB */}
            <TabsContent value="online">
              <div className="w-full mt-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  {/* Search */}
                  <div className="relative flex-shrink-0 w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      type="text"
                      placeholder="Search..."
                      value={onlineSearch}
                      onChange={(e) => {
                        setOnlineSearch(e.target.value);
                        setOnlinePage(1);
                      }}
                      className="pl-10 pr-4 w-full"
                    />
                  </div>

                  {/* Filters + Export */}
                  <div className="flex items-center gap-5 flex-wrap">
                    {[
                      "Company Unit",
                      "Department",
                      "Course",
                      "Status",
                      "Date",
                    ].map((f) => (
                      <Button
                        key={f}
                        variant="outline"
                        className="flex items-center gap-2 border border-gray-400"
                        onClick={() => handleFilter(f)}
                      >
                        <SlidersHorizontal className="w-4 h-4" /> {f}
                      </Button>
                    ))}
                    <Button className="bg-green-500 text-white flex items-center gap-2 hover:bg-green-600">
                      <Download className="w-4 h-4" /> Export
                    </Button>
                  </div>
                </div>
              </div>

              {/* Table Online */}
              <div className="mt-5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Checkbox
                          checked={
                            onlineSelected.length === filteredOnline.length &&
                            filteredOnline.length > 0
                          }
                          indeterminate={
                            onlineSelected.length > 0 &&
                            onlineSelected.length < filteredOnline.length
                          }
                          onCheckedChange={toggleAllOnline}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Course</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Expire</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOnline.map((e) => (
                      <TableRow key={e.employeeid}>
                        <TableCell>
                          <Checkbox
                            checked={onlineSelected.includes(e.employeeid)}
                            onCheckedChange={() =>
                              toggleOneOnline(e.employeeid)
                            }
                          />
                        </TableCell>
                        <TableCell>{e.name}</TableCell>
                        <TableCell>{e.employeeid}</TableCell>
                        <TableCell>{e.position}</TableCell>
                        <TableCell>{e.department}</TableCell>
                        <TableCell>{e.company}</TableCell>
                        <TableCell>{e.course}</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              e.status === "Failed"
                                ? "bg-red-500 text-white"
                                : e.status === "Passed"
                                ? "bg-green-500 text-white"
                                : "bg-gray-300 text-black"
                            }
                          >
                            {e.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{e.score}</TableCell>
                        <TableCell>{e.date}</TableCell>
                        <TableCell>{e.expire}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination Online */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Page {onlinePage} of {totalOnlinePages} — Showing{" "}
                    {startOnline + 1} to{" "}
                    {Math.min(startOnline + rowsPerPage, filteredOnline.length)}{" "}
                    of {filteredOnline.length} employees
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOnlinePage((p) => Math.max(p - 1, 1))}
                      disabled={onlinePage === 1}
                    >
                      ‹
                    </Button>
                    <span className="px-2">
                      {onlinePage} / {totalOnlinePages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setOnlinePage((p) => Math.min(p + 1, totalOnlinePages))
                      }
                      disabled={onlinePage === totalOnlinePages}
                    >
                      ›
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* OFFLINE TAB */}
            <TabsContent value="offline">
              <div className="w-full mt-5">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  {/* Add Employee + Search */}
                  <div className="flex items-center gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-green-500 text-white flex items-center gap-2 hover:bg-green-600">
                          + Add Employee
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                          <DialogTitle>
                            Add Offline Employee Certificate
                          </DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                          {[
                            "Employee ID",
                            "Name",
                            "Position",
                            "Department",
                            "Company Unit",
                            "Training Title",
                            "Provider",
                            "Certificate ID",
                            "Issued Date",
                            "Expired Date",
                          ].map((label, idx) => (
                            <div
                              key={idx}
                              className="grid grid-cols-4 items-center gap-4"
                            >
                              <Label className="text-right">{label}</Label>
                              <Input className="col-span-3 border border-gray-500" />
                            </div>
                          ))}
                          <div className="grid grid-cols-4 items-center gap-4">
                            <Label className="text-right">
                              Upload Certificate
                            </Label>
                            <Input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              className="col-span-3 border border-gray-500"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button
                            type="submit"
                            className="bg-blue-500 text-white hover:bg-blue-600"
                          >
                            Save
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Search */}
                    <div className="relative flex-shrink-0 w-96">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <Input
                        type="text"
                        placeholder="Search..."
                        value={offlineSearch}
                        onChange={(e) => {
                          setOfflineSearch(e.target.value);
                          setOfflinePage(1);
                        }}
                        className="pl-10 pr-4 w-full"
                      />
                    </div>
                  </div>

                  {/* Filters + Export */}
                  <div className="flex items-center gap-5 flex-wrap">
                    {[
                      "Company Unit",
                      "Department",
                      "Training",
                      "Status",
                      "Date",
                    ].map((f) => (
                      <Button
                        key={f}
                        variant="outline"
                        className="flex items-center gap-2 border border-gray-400"
                        onClick={() => handleFilter(f)}
                      >
                        <SlidersHorizontal className="w-4 h-4" /> {f}
                      </Button>
                    ))}
                    <Button className="bg-green-500 text-white flex items-center gap-2 hover:bg-green-600">
                      <Download className="w-4 h-4" /> Export
                    </Button>
                  </div>
                </div>
              </div>

              {/* Table Offline */}
              <div className="mt-5">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Checkbox
                          checked={
                            offlineSelected.length === filteredOffline.length &&
                            filteredOffline.length > 0
                          }
                          indeterminate={
                            offlineSelected.length > 0 &&
                            offlineSelected.length < filteredOffline.length
                          }
                          onCheckedChange={toggleAllOffline}
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Company Unit</TableHead>
                      <TableHead>Training Title</TableHead>
                      <TableHead>Provider</TableHead>
                      <TableHead>Certificate ID</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Expire</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedOffline.map((e) => (
                      <TableRow key={e.employeeid}>
                        <TableCell>
                          <Checkbox
                            checked={offlineSelected.includes(e.employeeid)}
                            onCheckedChange={() =>
                              toggleOneOffline(e.employeeid)
                            }
                          />
                        </TableCell>
                        <TableCell>{e.name}</TableCell>
                        <TableCell>{e.employeeid}</TableCell>
                        <TableCell>{e.position}</TableCell>
                        <TableCell>{e.department}</TableCell>
                        <TableCell>{e.company}</TableCell>
                        <TableCell>{e.trainingtitle}</TableCell>
                        <TableCell>{e.provider}</TableCell>
                        <TableCell>{e.certificateid}</TableCell>
                        <TableCell>{e.date}</TableCell>
                        <TableCell>{e.expire}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination Offline */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-600">
                    Page {offlinePage} of {totalOfflinePages} — Showing{" "}
                    {startOffline + 1} to{" "}
                    {Math.min(
                      startOffline + rowsPerPage,
                      filteredOffline.length
                    )}{" "}
                    of {filteredOffline.length} employees
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setOfflinePage((p) => Math.max(p - 1, 1))}
                      disabled={offlinePage === 1}
                    >
                      ‹
                    </Button>
                    <span className="px-2">
                      {offlinePage} / {totalOfflinePages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setOfflinePage((p) =>
                          Math.min(p + 1, totalOfflinePages)
                        )
                      }
                      disabled={offlinePage === totalOfflinePages}
                    >
                      ›
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

ReportPage.layout = Admin;

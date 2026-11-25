"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { dataStore } from "@/lib/data/store";
import { AdminCard } from "@/components/admin/AdminCard";
import { AdminModal } from "@/components/admin/AdminModal";
import { UniversityBadge } from "@/components/shared/UniversityLogo";
import {
  Building2,
  Plus,
  Search,
  Filter,
  Globe2,
  Award,
  ExternalLink,
  Edit,
  CheckCircle2,
  Calendar,
  GraduationCap,
  Sparkles,
  BookOpen,
  DollarSign,
  ChevronRight,
} from "lucide-react";

export default function UniversityManagementPage() {
  const [tick, setTick] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [countryFilter, setCountryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [intakeFilter, setIntakeFilter] = useState("all");

  // Modals
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Forms
  const [formData, setFormData] = useState({
    name: "",
    country: "United Kingdom",
    city: "",
    campus: "Main Campus",
    ranking: "50",
    qsRankDisplay: "#50",
    theRankDisplay: "Top Global",
    typeGroup: "Public",
    russellGroup: false,
    estimatedTuition: "£18,000–£24,000",
    tuitionFee: "20000",
    typicalIelts: "6.0–6.5",
    minIelts: "6.5",
    minCgpa: "60%",
    mainIntakes: "Sep, Jan",
    keyStrengths: "Computer Science, Engineering",
    websiteUrl: "https://",
    intakeDeadlines: "Fall 2026: June 30, 2026",
  });

  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    const unsub = dataStore.subscribe(() => setTick((t) => t + 1));
    return () => unsub();
  }, []);

  const universities = dataStore.getAllUniversities();
  const allCourses = dataStore.getAllCourses();

  // Ensure unique list of universities by name
  const uniqueUniversities = useMemo(() => {
    const seen = new Set<string>();
    const list: any[] = [];
    for (const u of universities) {
      const key = u.name?.trim().toLowerCase();
      if (key && !seen.has(key)) {
        seen.add(key);
        list.push(u);
      }
    }
    return list;
  }, [universities]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // Supported countries tab list with flag and dynamic counts
  const countryTabs = useMemo(() => {
    const list = [
      { id: "all", label: "All Destinations", flag: "🌐", count: uniqueUniversities.length },
      {
        id: "United Kingdom",
        label: "United Kingdom",
        flag: "🇬🇧",
        count: uniqueUniversities.filter((u) => u.country === "United Kingdom").length,
      },
      {
        id: "USA",
        label: "USA",
        flag: "🇺🇸",
        count: uniqueUniversities.filter((u) => u.country === "USA" || u.country === "United States").length,
      },
      {
        id: "Australia",
        label: "Australia",
        flag: "🇦🇺",
        count: uniqueUniversities.filter((u) => u.country === "Australia").length,
      },
      {
        id: "Canada",
        label: "Canada",
        flag: "🇨🇦",
        count: uniqueUniversities.filter((u) => u.country === "Canada").length,
      },
      {
        id: "Germany",
        label: "Germany",
        flag: "🇩🇪",
        count: uniqueUniversities.filter((u) => u.country === "Germany").length,
      },
      {
        id: "New Zealand",
        label: "New Zealand",
        flag: "🇳🇿",
        count: uniqueUniversities.filter((u) => u.country === "New Zealand").length,
      },
    ];
    return list;
  }, [uniqueUniversities]);

  // Filtered universities based on selected country
  const countryFilteredList = useMemo(() => {
    if (countryFilter === "all") return uniqueUniversities;
    if (countryFilter === "USA") {
      return uniqueUniversities.filter((u) => u.country === "USA" || u.country === "United States");
    }
    return uniqueUniversities.filter((u) => u.country === countryFilter);
  }, [uniqueUniversities, countryFilter]);

  // Filtered by search, type, and intake
  const filteredUniversities = useMemo(() => {
    return countryFilteredList.filter((u: any) => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        u.name.toLowerCase().includes(q) ||
        u.city.toLowerCase().includes(q) ||
        u.country.toLowerCase().includes(q) ||
        (u.keyStrengths && u.keyStrengths.toLowerCase().includes(q)) ||
        (u.qsRankDisplay && u.qsRankDisplay.toLowerCase().includes(q));

      let matchType = true;
      if (typeFilter === "prestige") {
        matchType = !!(
          u.russellGroup ||
          u.typeGroup?.includes("Russell Group") ||
          u.typeGroup?.includes("Ivy") ||
          u.typeGroup?.includes("Group of Eight") ||
          u.typeGroup?.includes("U15") ||
          u.typeGroup?.includes("TU9") ||
          u.typeGroup?.includes("Excellence")
        );
      } else if (typeFilter === "public") {
        matchType = u.typeGroup?.toLowerCase().includes("public") || false;
      } else if (typeFilter === "private") {
        matchType = u.typeGroup?.toLowerCase().includes("private") || false;
      }

      let matchIntake = true;
      if (intakeFilter === "jan") {
        matchIntake =
          u.mainIntakes?.toLowerCase().includes("jan") ||
          u.mainIntakes?.toLowerCase().includes("feb") ||
          u.mainIntakes?.toLowerCase().includes("winter");
      } else if (intakeFilter === "may") {
        matchIntake =
          u.mainIntakes?.toLowerCase().includes("may") ||
          u.mainIntakes?.toLowerCase().includes("spring") ||
          u.mainIntakes?.toLowerCase().includes("summer");
      } else if (intakeFilter === "sep") {
        matchIntake =
          u.mainIntakes?.toLowerCase().includes("sep") ||
          u.mainIntakes?.toLowerCase().includes("aug") ||
          u.mainIntakes?.toLowerCase().includes("fall") ||
          u.mainIntakes?.toLowerCase().includes("oct");
      }

      return matchSearch && matchType && matchIntake;
    });
  }, [countryFilteredList, searchQuery, typeFilter, intakeFilter]);

  // Dynamic KPI Ribbon calculations
  const kpiData = useMemo(() => {
    const list = countryFilteredList;
    const totalCount = list.length;

    let prestigeTitle = "PRESTIGE GROUP";
    let prestigeCount = 0;
    let prestigeDesc = "Leading research institutions";

    if (countryFilter === "United Kingdom") {
      prestigeTitle = "RUSSELL GROUP";
      prestigeCount = list.filter((u: any) => u.russellGroup || u.typeGroup?.includes("Russell Group")).length;
      prestigeDesc = "Elite UK research universities";
    } else if (countryFilter === "USA") {
      prestigeTitle = "IVY PLUS & R1 FLAGSHIPS";
      prestigeCount = list.filter(
        (u: any) =>
          u.typeGroup?.includes("Ivy") ||
          u.typeGroup?.includes("Tier 1") ||
          u.typeGroup?.includes("AAU") ||
          u.tier === "ambitious"
      ).length;
      prestigeDesc = "Top US research powerhouses";
    } else if (countryFilter === "Australia") {
      prestigeTitle = "GROUP OF EIGHT (GO8)";
      prestigeCount = list.filter((u: any) => u.typeGroup?.includes("Group of Eight")).length;
      prestigeDesc = "Australia's leading research universities";
    } else if (countryFilter === "Canada") {
      prestigeTitle = "U15 RESEARCH GROUP";
      prestigeCount = list.filter((u: any) => u.typeGroup?.includes("U15")).length;
      prestigeDesc = "Canada's premier research network";
    } else if (countryFilter === "Germany") {
      prestigeTitle = "TU9 & EXCELLENCE";
      prestigeCount = list.filter(
        (u: any) => u.typeGroup?.includes("TU9") || u.typeGroup?.includes("Excellence")
      ).length;
      prestigeDesc = "German technical & excellence hubs";
    } else if (countryFilter === "New Zealand") {
      prestigeTitle = "TOP 3% WORLD RANKED";
      prestigeCount = list.length;
      prestigeDesc = "Accredited NZ public institutions";
    } else {
      prestigeTitle = "GLOBAL TOP TIER";
      prestigeCount = uniqueUniversities.filter((u: any) => u.tier === "ambitious").length;
      prestigeDesc = "World top 100 ranking institutions";
    }

    const multiIntakeCount = list.filter(
      (u: any) =>
        u.mainIntakes?.includes(",") ||
        u.mainIntakes?.includes("Jan") ||
        u.mainIntakes?.includes("Spring") ||
        u.mainIntakes?.includes("Feb") ||
        u.mainIntakes?.includes("July")
    ).length;

    // Course count for this country
    const countryUniIds = new Set(list.map((u) => u.id));
    const countryUniNames = new Set(list.map((u) => u.name?.trim().toLowerCase()));
    const countryCoursesCount =
      countryFilter === "all"
        ? allCourses.length
        : allCourses.filter((c) => countryUniIds.has(c.universityId) || (c.universityName && countryUniNames.has(c.universityName.trim().toLowerCase()))).length;

    return {
      totalCount,
      prestigeTitle,
      prestigeCount,
      prestigeDesc,
      multiIntakeCount,
      coursesCount: countryCoursesCount,
    };
  }, [countryFilteredList, countryFilter, uniqueUniversities, allCourses]);

  const handleOpenAdd = () => {
    const c = countryFilter === "all" ? "United Kingdom" : countryFilter;
    const defaultTuition =
      c === "United Kingdom"
        ? "£18,000–£24,000"
        : c === "USA"
        ? "$35,000–$50,000"
        : c === "Australia"
        ? "A$38,000–A$46,000"
        : c === "Canada"
        ? "C$26,000–C$36,000"
        : c === "Germany"
        ? "€1,500–€3,000"
        : c === "New Zealand"
        ? "NZ$34,000–NZ$42,000"
        : "£18,000–£24,000";

    setFormData({
      name: "",
      country: c,
      city: "",
      campus: "Main Campus",
      ranking: "50",
      qsRankDisplay: "#50",
      theRankDisplay: "Top 100",
      typeGroup: "Public",
      russellGroup: false,
      estimatedTuition: defaultTuition,
      tuitionFee: "22000",
      typicalIelts: "6.5 (Min 6.0 bands)",
      minIelts: "6.5",
      minCgpa: "60%",
      mainIntakes: "Sep, Jan",
      keyStrengths: "Engineering, Business, Computing",
      websiteUrl: "https://",
      intakeDeadlines: "Fall 2026: June 30, 2026",
    });
    setIsAddOpen(true);
  };

  const handleOpenEdit = (uni: any) => {
    setEditingId(uni.id);
    setFormData({
      name: uni.name || "",
      country: uni.country || "United Kingdom",
      city: uni.city || "",
      campus: uni.campus || "Main Campus",
      ranking: String(uni.ranking || 100),
      qsRankDisplay: uni.qsRankDisplay || `#${uni.ranking || 100}`,
      theRankDisplay: uni.theRankDisplay || "Top Global",
      typeGroup: uni.typeGroup || (uni.russellGroup ? "Public (Russell Group)" : "Public"),
      russellGroup: !!uni.russellGroup,
      estimatedTuition: uni.estimatedTuition || "£18,000–£24,000",
      tuitionFee: String(uni.tuitionFee || 20000),
      typicalIelts: uni.typicalIelts || uni.minIelts || "6.5",
      minIelts: uni.minIelts || "6.5",
      minCgpa: uni.minCgpa || "60%",
      mainIntakes: uni.mainIntakes || "Sep, Jan",
      keyStrengths: uni.keyStrengths || uni.course || "",
      websiteUrl: uni.websiteUrl || "https://",
      intakeDeadlines: uni.intakeDeadlines || "Fall 2026: June 30, 2026",
    });
    setIsEditOpen(true);
  };

  const handleCreateUniversity = (e: React.FormEvent) => {
    e.preventDefault();
    const numericRank = parseInt(formData.ranking, 10) || 100;
    const qsDisplay = formData.qsRankDisplay?.trim() || `#${numericRank}`;

    dataStore.addUniversity({
      name: formData.name.trim(),
      country: formData.country,
      city: formData.city.trim(),
      campus: formData.campus.trim(),
      ranking: numericRank,
      qsRankDisplay: qsDisplay,
      theRankDisplay: formData.theRankDisplay?.trim() || "Top Global",
      typeGroup: formData.typeGroup?.trim() || "Public",
      russellGroup: formData.country === "United Kingdom" ? formData.russellGroup : false,
      estimatedTuition: formData.estimatedTuition?.trim() || "Standard Tuition",
      tuitionFee: Number(formData.tuitionFee) || 20000,
      typicalIelts: formData.typicalIelts?.trim() || formData.minIelts || "6.5",
      minCgpa: formData.minCgpa?.trim() || "60%",
      minIelts: formData.minIelts?.trim() || "6.5",
      mainIntakes: formData.mainIntakes?.trim() || "Sep, Jan",
      keyStrengths: formData.keyStrengths?.trim() || "Computer Science, Engineering",
      websiteUrl: formData.websiteUrl?.trim() || "https://gvkedutech.com",
      intakeDeadlines: formData.intakeDeadlines?.trim() || "Fall 2026: June 30, 2026",
    });
    setIsAddOpen(false);
    showToast(`✓ Successfully added ${formData.name} to the university repository.`);
  };

  const handleUpdateUniversity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    const numericRank = parseInt(formData.ranking, 10) || 100;
    const qsDisplay = formData.qsRankDisplay?.trim() || `#${numericRank}`;

    const updates = {
      name: formData.name.trim(),
      country: formData.country,
      city: formData.city.trim(),
      campus: formData.campus.trim(),
      ranking: numericRank,
      qsRankDisplay: qsDisplay,
      theRankDisplay: formData.theRankDisplay?.trim() || "Top Global",
      typeGroup: formData.typeGroup?.trim() || "Public",
      russellGroup: formData.country === "United Kingdom" ? formData.russellGroup : false,
      estimatedTuition: formData.estimatedTuition?.trim() || "Standard Tuition",
      tuitionFee: Number(formData.tuitionFee) || 20000,
      typicalIelts: formData.typicalIelts?.trim() || formData.minIelts?.trim() || "6.5",
      minIelts: formData.minIelts?.trim() || "6.5",
      minCgpa: formData.minCgpa?.trim() || "60%",
      mainIntakes: formData.mainIntakes?.trim() || "Sep, Jan",
      keyStrengths: formData.keyStrengths?.trim() || "",
      websiteUrl: formData.websiteUrl?.trim() || "https://",
      intakeDeadlines: formData.intakeDeadlines?.trim() || "Fall 2026: June 30, 2026",
    };

    dataStore.updateUniversity(editingId, updates);

    // Persist to MongoDB Atlas asynchronously
    try {
      await fetch("/api/db/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_university",
          payload: { id: editingId, updates },
        }),
      });
    } catch (err) {}

    setIsEditOpen(false);
    showToast(`✓ Updated tuition fee, ranking & benchmarks for ${formData.name}.`);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-in fade-in slide-in-from-bottom-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Institutional University Management
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Multi-destination global university database, admissions benchmarks, and seasonal application deadlines.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#253775] text-white rounded-lg text-xs font-semibold hover:bg-[#1c2a5e] shadow-sm transition-colors"
        >
          <Plus className="w-4 h-4" /> Add University
        </button>
      </div>

      {/* PROMINENT COUNTRY SELECTOR TAB BAR */}
      <div className="bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-2 px-2 pt-1">
          <div className="flex items-center gap-2">
            <Globe2 className="w-4 h-4 text-[#253775]" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Select Study Destination
            </span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            {countryFilter === "all" ? "Showing all countries" : `Filtered: ${countryFilter}`}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none">
          {countryTabs.map((tab) => {
            const isActive = countryFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setCountryFilter(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-[#253775] text-white shadow-sm ring-2 ring-[#253775]/20"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200"
                }`}
              >
                <span className="text-sm leading-none">{tab.flag}</span>
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* DYNAMIC KPI RIBBON */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {countryFilter === "all" ? "TOTAL INSTITUTIONS" : `${countryFilter.toUpperCase()} UNIVERSITIES`}
            </span>
            <Building2 className="w-4 h-4 text-[#253775]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2">{kpiData.totalCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">
            {countryFilter === "all" ? "Accredited global institutions" : `Campuses in ${countryFilter}`}
          </p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">
              {kpiData.prestigeTitle}
            </span>
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-700 mt-2">{kpiData.prestigeCount}</div>
          <p className="text-[11px] text-amber-700 mt-1">{kpiData.prestigeDesc}</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Multi-Intake Campuses
            </span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-blue-700 mt-2">{kpiData.multiIntakeCount}</div>
          <p className="text-[11px] text-blue-600 mt-1">Rolling & secondary intakes</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">
              Curated Courses
            </span>
            <GraduationCap className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-emerald-700 mt-2">{kpiData.coursesCount}</div>
          <p className="text-[11px] text-emerald-700 mt-1">Postgraduate Master&apos;s programs</p>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${countryFilter === "all" ? "all universities" : countryFilter + " universities"} by name, city, ranking, or discipline...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-[#253775] text-slate-800"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Country Quick Select (in sync with tabs) */}
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700 font-bold"
          >
            {countryTabs.map((tab) => (
              <option key={tab.id} value={tab.id}>
                {tab.flag} {tab.label} ({tab.count})
              </option>
            ))}
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700 font-medium"
          >
            <option value="all">All Institutional Types</option>
            <option value="prestige">🏛️ Prestige Networks (Russell / Ivy / Go8 / U15 / TU9)</option>
            <option value="public">Public Universities</option>
            <option value="private">Private / Specialist</option>
          </select>

          {/* Intake Filter */}
          <select
            value={intakeFilter}
            onChange={(e) => setIntakeFilter(e.target.value)}
            className="border border-slate-200 rounded-lg text-xs px-3 py-2 outline-none focus:border-[#253775] bg-white text-slate-700 font-medium"
          >
            <option value="all">All Intakes</option>
            <option value="sep">Fall / September Intake</option>
            <option value="jan">Spring / January Intake</option>
            <option value="may">Summer / May Intake</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <AdminCard
        title={
          countryFilter === "all"
            ? "Global University Master Directory"
            : `${countryFilter} University Master Directory`
        }
        subtitle={`Displaying ${filteredUniversities.length} of ${countryFilteredList.length} accredited institutions with rankings, tuition & intakes`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs table-fixed">
            <colgroup>
              <col className="w-[28%]" />
              <col className="w-[13%]" />
              <col className="w-[12%]" />
              <col className="w-[13%]" />
              <col className="w-[13%]" />
              <col className="w-[13%]" />
              <col className="w-[8%]" />
            </colgroup>
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200 text-[10px]">
              <tr>
                <th className="py-2.5 px-3">University & Type</th>
                <th className="py-2.5 px-2">City & Country</th>
                <th className="py-2.5 px-2">World Rankings</th>
                <th className="py-2.5 px-2">Est. Tuition</th>
                <th className="py-2.5 px-2">Benchmarks</th>
                <th className="py-2.5 px-2">Key Strengths</th>
                <th className="py-2.5 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUniversities.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-slate-600">No universities match your search criteria.</p>
                    <p className="text-xs text-slate-400 mt-1">Try clearing filters or switching destinations.</p>
                  </td>
                </tr>
              ) : (
                filteredUniversities.map((uni: any) => {
                  const countryFlag =
                    uni.country === "United Kingdom"
                      ? "🇬🇧"
                      : uni.country === "USA" || uni.country === "United States"
                      ? "🇺🇸"
                      : uni.country === "Australia"
                      ? "🇦🇺"
                      : uni.country === "Canada"
                      ? "🇨🇦"
                      : uni.country === "Germany"
                      ? "🇩🇪"
                      : uni.country === "New Zealand"
                      ? "🇳🇿"
                      : "🌐";

                  return (
                    <tr key={uni.id} className="hover:bg-slate-50 transition-colors">
                      {/* University & Type */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <UniversityBadge name={uni.name} country={uni.country} size="sm" showCountryFlag />
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-slate-900 leading-snug truncate text-xs" title={uni.name}>
                              {uni.name}
                            </div>
                            <div className="flex flex-wrap items-center gap-1 mt-0.5 text-[9.5px]">
                              {uni.russellGroup && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-900 font-bold border border-amber-300">
                                  🏛️ Russell Group
                                </span>
                              )}
                              {uni.typeGroup && !uni.russellGroup && (
                                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200">
                                  {uni.typeGroup}
                                </span>
                              )}
                              {uni.websiteUrl && (
                                <a
                                  href={uni.websiteUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-0.5 text-blue-600 hover:underline"
                                >
                                  <span>Website</span>
                                  <ExternalLink className="w-2 h-2" />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* City & Country - Compact */}
                      <td className="py-2.5 px-2">
                        <div className="font-semibold text-slate-800 text-[11px] truncate leading-tight" title={uni.city}>
                          {uni.city}
                        </div>
                        <div
                          className="text-[10px] text-slate-500 font-medium inline-flex items-center gap-1 mt-0.5 truncate max-w-full leading-tight"
                          title={uni.country}
                        >
                          <span className="shrink-0">{countryFlag}</span>
                          <span className="truncate">
                            {uni.country === "United Kingdom"
                              ? "UK"
                              : uni.country === "United States"
                              ? "USA"
                              : uni.country}
                          </span>
                        </div>
                      </td>

                      {/* World Rankings 2027 */}
                      <td className="py-2.5 px-2">
                        <div className="space-y-0.5">
                          <div className="font-mono text-[10.5px] font-bold text-slate-800 leading-tight">
                            <span className="text-slate-400 font-sans text-[9px]">QS: </span>
                            {uni.qsRankDisplay || `#${uni.ranking}`}
                          </div>
                          <div className="font-mono text-[10px] text-slate-600 leading-tight">
                            <span className="text-slate-400 font-sans text-[9px]">THE: </span>
                            {uni.theRankDisplay || "Top Global"}
                          </div>
                        </div>
                      </td>

                      {/* Est. Tuition */}
                      <td className="py-2.5 px-2">
                        <span className="font-semibold text-slate-900 block text-[11px] leading-tight truncate">
                          {uni.estimatedTuition || "Standard"}
                        </span>
                        <span className="text-[9.5px] text-slate-400 leading-tight">per academic year</span>
                      </td>

                      {/* Benchmarks */}
                      <td className="py-2.5 px-2 text-slate-700">
                        <div className="text-[10.5px] leading-tight">
                          <span className="text-slate-400 text-[9px]">IELTS:</span>{" "}
                          <strong className="text-slate-800 font-bold">
                            {uni.typicalIelts || uni.minIelts || "6.5"}
                          </strong>
                        </div>
                        <div className="text-[10px] text-slate-500 leading-tight mt-0.5 truncate" title={uni.minCgpa || "60%"}>
                          <span className="text-slate-400 text-[9px]">CGPA:</span>{" "}
                          {uni.minCgpa ? uni.minCgpa.split("(")[0].trim() : "60%"}
                        </div>
                      </td>

                      {/* Key Strengths */}
                      <td className="py-2.5 px-2">
                        <div className="text-[10.5px] text-slate-700 leading-snug line-clamp-2" title={uni.keyStrengths}>
                          {uni.keyStrengths || uni.course || "Computer Science, Engineering"}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2.5 px-2 text-right">
                        <button
                          onClick={() => handleOpenEdit(uni)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-[#253775] hover:text-white text-slate-700 rounded-lg text-xs font-bold transition-all shadow-2xs"
                        >
                          <Edit className="w-3 h-3 text-slate-500 hover:text-white" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </AdminCard>

      {/* COMPREHENSIVE ADD / EDIT UNIVERSITY MODAL */}
      <AdminModal
        isOpen={isAddOpen || isEditOpen}
        onClose={() => {
          setIsAddOpen(false);
          setIsEditOpen(false);
        }}
        title={isAddOpen ? "Add New University to Catalog" : `Edit University Parameters: ${formData.name}`}
        description="Modify tuition fees, global rankings, academic entry benchmarks, and institutional parameters."
        maxWidth="2xl"
      >
        <form onSubmit={isAddOpen ? handleCreateUniversity : handleUpdateUniversity} className="space-y-4">
          {/* Section 1: Institution & Location */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#253775] uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>Institutional Identity & Location</span>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                University Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. University of Manchester"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white font-medium text-slate-900"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Country *
                </label>
                <select
                  required
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white font-semibold text-slate-800"
                >
                  <option value="United Kingdom">🇬🇧 United Kingdom</option>
                  <option value="USA">🇺🇸 USA</option>
                  <option value="Australia">🇦🇺 Australia</option>
                  <option value="Canada">🇨🇦 Canada</option>
                  <option value="Germany">🇩🇪 Germany</option>
                  <option value="New Zealand">🇳🇿 New Zealand</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">City / Region *</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="e.g. Manchester, England"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white font-medium text-slate-900"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Campus Location
                </label>
                <input
                  type="text"
                  value={formData.campus}
                  onChange={(e) => setFormData({ ...formData, campus: e.target.value })}
                  placeholder="e.g. Oxford Road Campus"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white font-medium text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Institutional Classification
                </label>
                <input
                  type="text"
                  value={formData.typeGroup}
                  onChange={(e) => setFormData({ ...formData, typeGroup: e.target.value })}
                  placeholder="e.g. Public (Russell Group), Private / Ivy Plus"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white font-medium text-slate-900"
                />
              </div>
            </div>
            {formData.country === "United Kingdom" && (
              <label className="inline-flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.russellGroup}
                  onChange={(e) => setFormData({ ...formData, russellGroup: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 text-[#253775] focus:ring-[#253775]"
                />
                <span className="text-xs font-bold text-amber-900">
                  🏛️ Official Russell Group Member Institution
                </span>
              </label>
            )}
          </div>

          {/* Section 2: Tuition Fee & Financials */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 uppercase tracking-wider">
              <DollarSign className="w-3.5 h-3.5 text-emerald-700" />
              <span>Tuition Fee & Financial Benchmarks</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Estimated Tuition Range (Display / yr) *
                </label>
                <input
                  type="text"
                  required
                  value={formData.estimatedTuition}
                  onChange={(e) => setFormData({ ...formData, estimatedTuition: e.target.value })}
                  placeholder="e.g. £18,000–£24,000 or $56,000–$64,000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none bg-white font-bold text-emerald-900"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Displayed in directory table and student application cards
                </span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Base Tuition Amount (Numeric)
                </label>
                <input
                  type="number"
                  value={formData.tuitionFee}
                  onChange={(e) => setFormData({ ...formData, tuitionFee: e.target.value })}
                  placeholder="e.g. 21000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-none bg-white font-mono font-semibold text-slate-800"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Numeric value used for financial calculations and deposits
                </span>
              </div>
            </div>
          </div>

          {/* Section 3: Rankings (QS & THE 2027) */}
          <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
              <Award className="w-3.5 h-3.5 text-blue-700" />
              <span>World Rankings 2027</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  QS Rank (Number) *
                </label>
                <input
                  type="number"
                  required
                  value={formData.ranking}
                  onChange={(e) => setFormData({ ...formData, ranking: e.target.value })}
                  placeholder="e.g. 416"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white font-mono font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Numeric sort order</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  QS Rank Display *
                </label>
                <input
                  type="text"
                  required
                  value={formData.qsRankDisplay}
                  onChange={(e) => setFormData({ ...formData, qsRankDisplay: e.target.value })}
                  placeholder="e.g. #416 or #801–1000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white font-bold text-slate-900"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">QS display label</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  THE Rank Display
                </label>
                <input
                  type="text"
                  value={formData.theRankDisplay}
                  onChange={(e) => setFormData({ ...formData, theRankDisplay: e.target.value })}
                  placeholder="e.g. #401–450"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none bg-white font-medium text-slate-800"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Times Higher Education</span>
              </div>
            </div>
          </div>

          {/* Section 4: Academic Entry Benchmarks */}
          <div className="p-3.5 rounded-xl bg-purple-50/60 border border-purple-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-purple-900 uppercase tracking-wider">
              <GraduationCap className="w-3.5 h-3.5 text-purple-700" />
              <span>Academic Entry Benchmarks</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  IELTS / English Requirement *
                </label>
                <input
                  type="text"
                  required
                  value={formData.typicalIelts}
                  onChange={(e) =>
                    setFormData({ ...formData, typicalIelts: e.target.value, minIelts: e.target.value })
                  }
                  placeholder="e.g. 6.0–6.5 (Min 5.5 in each band)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none bg-white font-semibold text-slate-900"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Band requirements</span>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Undergraduate CGPA / Percentage *
                </label>
                <input
                  type="text"
                  required
                  value={formData.minCgpa}
                  onChange={(e) => setFormData({ ...formData, minCgpa: e.target.value })}
                  placeholder="e.g. 60% (First Class / 2:1 Equivalent)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-purple-600 focus:border-transparent outline-none bg-white font-semibold text-slate-900"
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">Academic cutoff</span>
              </div>
            </div>
          </div>

          {/* Section 5: Intakes, Disciplines & Official Portal */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
              <Calendar className="w-3.5 h-3.5 text-[#253775]" />
              <span>Intakes & Key Disciplines</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Main Intakes (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.mainIntakes}
                  onChange={(e) => setFormData({ ...formData, mainIntakes: e.target.value })}
                  placeholder="e.g. Sep, Jan, May"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white font-medium text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Intake Deadlines Note
                </label>
                <input
                  type="text"
                  value={formData.intakeDeadlines}
                  onChange={(e) => setFormData({ ...formData, intakeDeadlines: e.target.value })}
                  placeholder="e.g. Fall 2026: June 30, 2026 / Spring 2027: Oct 15, 2026"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white font-medium text-slate-900"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Key Strengths & Popular Disciplines
              </label>
              <input
                type="text"
                value={formData.keyStrengths}
                onChange={(e) => setFormData({ ...formData, keyStrengths: e.target.value })}
                placeholder="e.g. Business, Engineering, Optometry, Pharmacy, AI"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white font-medium text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official Website URL
              </label>
              <input
                type="url"
                value={formData.websiteUrl}
                onChange={(e) => setFormData({ ...formData, websiteUrl: e.target.value })}
                placeholder="https://www.aston.ac.uk"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-[#253775] focus:border-transparent outline-none bg-white font-medium text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                setIsAddOpen(false);
                setIsEditOpen(false);
              }}
              className="px-4 py-2 border border-slate-300 rounded-lg text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#253775] hover:bg-[#1c2a5e] text-white rounded-lg text-xs font-bold transition-colors shadow-sm flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{isAddOpen ? "Add University to Catalog" : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </AdminModal>
    </div>
  );
}

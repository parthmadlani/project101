import { frameworks } from "./frameworks.js";

export function computeSkillGap(userSkills = {}, sector = "healthcare") {
  const target = frameworks[sector]?.skills || {};
  const allKeys = Array.from(new Set([...Object.keys(target), ...Object.keys(userSkills)]));
  const gaps = allKeys.map((name) => {
    const user = Number(userSkills[name] ?? 0);
    const req = Number(target[name] ?? 0);
    return { name, user, req, gap: Math.max(req - user, 0) };
  });
  const totalGap = gaps.reduce((acc, g) => acc + g.gap, 0);
  const progress = gaps.reduce((acc, g) => acc + Math.min(g.user, g.req), 0);
  const totalReq = gaps.reduce((acc, g) => acc + g.req, 0);
  const pct = totalReq ? Math.round((progress / totalReq) * 100) : 0;
  return { gaps, totalGap, progressPct: pct };
}

export function recommendFocusAreas(gapResult, topN = 5) {
  return [...gapResult.gaps]
    .sort((a, b) => b.gap - a.gap)
    .slice(0, topN)
    .map(({ name, gap, req }) => ({ skill: name, missing: gap, target: req }));
}

export function pathwaySuggestions(sector, gapResult) {
  const majorGaps = gapResult.gaps.filter(g => g.gap >= 2).map(g => g.name);
  const tips = [];
  if (sector === "healthcare") {
    if (majorGaps.includes("HL7/FHIR")) tips.push("Complete an HL7/FHIR intro course and build a simple FHIR API client.");
    if (majorGaps.includes("Health Data Privacy")) tips.push("Review HIPAA/GDPR basics and implement de-identification in a sample dataset.");
  }
  if (sector === "agriculture") {
    if (majorGaps.includes("GIS/Remote Sensing")) tips.push("Try a QGIS tutorial and classify satellite imagery for crop health.");
    if (majorGaps.includes("IoT Sensors")) tips.push("Prototype sensor data ingestion with MQTT and visualize readings.");
  }
  if (sector === "urban") {
    if (majorGaps.includes("Mobility Systems")) tips.push("Explore GTFS datasets and analyze transit reliability.");
    if (majorGaps.includes("Cybersecurity")) tips.push("Harden a mock smart device pipeline with authentication and logging.");
  }
  return tips;
}

export function buildRoadmap(sector, gapResult) {
  const focus = recommendFocusAreas(gapResult, 5);

  // Sector-specific icons
  const sectorIcons = {
    healthcare: ['🏥', '💊', '📋', '🔬', '💉'],
    agriculture: ['🌾', '🚜', '🌱', '📡', '🌍'],
    urban: ['🏙️', '🚇', '💡', '🏗️', '♻️']
  };

  const icons = sectorIcons[sector] || sectorIcons.healthcare;

  return focus.map((f, i) => ({
    step: i + 1,
    skill: f.skill,
    icon: icons[i] || '📚',
    actions: [
      `Study fundamentals of ${f.skill}`,
      `Build a mini-project applying ${f.skill}`,
      `Document learnings and reflect on gaps`
    ]
  }));
}

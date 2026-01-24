#!/usr/bin/env node
/**
 * Root2Rise Demo Script
 * Demonstrates the full platform flow for hackathon judges
 */

import fetch from "node-fetch";

const API_URL = "http://localhost:8080";

// Sample user profiles for each sector
const demoProfiles = {
  healthcare: {
    name: "Sarah Chen - Healthcare Informatics Student",
    sector: "healthcare",
    skills: {
      "Clinical Data Standards": 2,
      "EHR Systems": 1,
      "HL7/FHIR": 1,
      "Health Data Privacy": 2,
      "Medical Terminology": 3,
      "Data Analysis (R/Python)": 2,
      "Interoperability": 1,
      "Patient Safety & QA": 2
    }
  },
  agriculture: {
    name: "Raj Kumar - Agricultural Tech Professional",
    sector: "agriculture",
    skills: {
      "Precision Agriculture": 2,
      "IoT Sensors": 3,
      "GIS/Remote Sensing": 1,
      "Crop Science Basics": 2,
      "Farm Management": 2,
      "Data Analysis (R/Python)": 3,
      "Sustainability": 2,
      "Supply Chain": 1
    }
  },
  urban: {
    name: "Maria Santos - Urban Planning Graduate",
    sector: "urban",
    skills: {
      "Urban Planning": 3,
      "IoT & Edge": 1,
      "Mobility Systems": 2,
      "Energy & Grids": 1,
      "GIS/Spatial Analysis": 2,
      "Data Platforms": 2,
      "Policy & Governance": 3,
      "Cybersecurity": 1
    }
  }
};

async function runDemo(sectorKey) {
  const profile = demoProfiles[sectorKey];
  
  console.log("\n" + "=".repeat(70));
  console.log(`🎓 DEMO: ${profile.name}`);
  console.log("=".repeat(70));
  
  // 1. Show profile
  console.log("\n📝 User Profile:");
  console.log(`   Sector: ${profile.sector}`);
  console.log(`   Skills entered:`);
  Object.entries(profile.skills).forEach(([skill, level]) => {
    console.log(`     - ${skill}: ${level}/5`);
  });

  // 2. Save profile
  console.log("\n💾 Saving profile to backend...");
  try {
    const saveRes = await fetch(`${API_URL}/profiles/me`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sector: profile.sector, skills: profile.skills })
    });
    if (saveRes.ok) {
      console.log("   ✅ Profile saved successfully");
    }
  } catch (e) {
    console.error("   ❌ Failed to save profile:", e.message);
  }

  // 3. Gap analysis
  console.log("\n📊 Running skill gap analysis...");
  try {
    const gapRes = await fetch(`${API_URL}/analysis/gap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sector: profile.sector, skills: profile.skills })
    });
    const gapData = await gapRes.json();
    
    console.log(`   Progress: ${gapData.progressPct}% of target skills achieved`);
    console.log(`   Total gap: ${gapData.totalGap} skill points to reach career readiness`);
    
    console.log("\n   🎯 Top 3 Skills to Focus On:");
    gapData.gaps
      .sort((a, b) => b.gap - a.gap)
      .slice(0, 3)
      .forEach((g, i) => {
        console.log(`     ${i + 1}. ${g.name}: need ${g.gap} more points (current: ${g.user}, target: ${g.req})`);
      });
  } catch (e) {
    console.error("   ❌ Gap analysis failed:", e.message);
  }

  // 4. Roadmap
  console.log("\n🗺️  Generating personalized learning roadmap...");
  try {
    const roadmapRes = await fetch(`${API_URL}/roadmap`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sector: profile.sector, skills: profile.skills })
    });
    const roadmapData = await roadmapRes.json();
    
    if (roadmapData.tips && roadmapData.tips.length > 0) {
      console.log("\n   💡 Pathway Suggestions:");
      roadmapData.tips.forEach((tip, i) => {
        console.log(`     ${i + 1}. ${tip}`);
      });
    }
    
    if (roadmapData.roadmap && roadmapData.roadmap.length > 0) {
      console.log("\n   📚 Learning Steps:");
      roadmapData.roadmap.slice(0, 3).forEach((step) => {
        console.log(`\n     Step ${step.step}: ${step.skill}`);
        step.actions.forEach(action => {
          console.log(`       • ${action}`);
        });
      });
    }
  } catch (e) {
    console.error("   ❌ Roadmap generation failed:", e.message);
  }

  // 5. Recommendations
  console.log("\n🔍 Fetching learning resources from OpenAlex...");
  try {
    const recRes = await fetch(`${API_URL}/recommendations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sector: profile.sector, skills: profile.skills })
    });
    const recData = await recRes.json();
    
    console.log(`   Search query: "${recData.query}"`);
    console.log(`   Found ${recData.items.length} scholarly resources\n`);
    
    console.log("   📖 Top 3 Resources:");
    recData.items.slice(0, 3).forEach((item, i) => {
      console.log(`\n     ${i + 1}. ${item.title}`);
      console.log(`        Source: ${item.hostVenue || item.type}`);
      console.log(`        Year: ${item.year} | Citations: ${item.citedBy}`);
      if (item.link) console.log(`        Link: ${item.link}`);
    });
  } catch (e) {
    console.error("   ❌ Recommendations fetch failed:", e.message);
  }

  console.log("\n" + "=".repeat(70) + "\n");
}

async function main() {
  console.log("\n");
  console.log("╔═══════════════════════════════════════════════════════════════════╗");
  console.log("║           Root2Rise: Skill Intelligence Platform Demo            ║");
  console.log("║        Healthcare • Agriculture • Urban/Smart City Sectors        ║");
  console.log("╚═══════════════════════════════════════════════════════════════════╝");
  
  const sector = process.argv[2] || "all";
  
  if (sector === "all") {
    await runDemo("healthcare");
    await runDemo("agriculture");
    await runDemo("urban");
  } else if (demoProfiles[sector]) {
    await runDemo(sector);
  } else {
    console.log("\nUsage: node demo.js [healthcare|agriculture|urban|all]");
    console.log("\nExample: node demo.js healthcare");
    process.exit(1);
  }
  
  console.log("\n✅ Demo complete! Visit http://localhost:5174 to try the web interface.");
  console.log("📚 API Documentation: http://localhost:8080/docs\n");
}

main().catch(console.error);

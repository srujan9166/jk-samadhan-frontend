import React, { useState, useEffect } from 'react';

// Detailed static mapping of categories and subcategories matching legacy requirements
const categoryHierarchy = {
  ari: {
    name: 'ARI & TRAININGS DEPARTMENT',
    categories: {
      'Training Process': {
        subcategories: ['Admission Issues', 'Course Material Delay', 'Examination Discrepancy', 'Certification Delay']
      },
      'Rule Interpretation': {
        subcategories: ['Service Classification', 'Leave Rules Clarification', 'Pension Rules Guide']
      },
      'Service Rules': {
        subcategories: ['Seniority Dispute', 'Promotion Eligibility', 'Recruitment Process']
      },
      'Other ARI Issues': {
        subcategories: ['Infrastructure Complaints', 'Staff Misbehaviour', 'Miscellaneous']
      }
    }
  },
  pwd: {
    name: 'Public Works Department (R&B)',
    categories: {
      'Road Repair': {
        subcategories: ['Potholes Filling', 'Black-topping Delay', 'Waterlogging Issues', 'Encroachment']
      },
      'Bridge Construction': {
        subcategories: ['Pending Construction', 'Safety Clearance Delay', 'Substandard Material Usage']
      },
      'Building Maintenance': {
        subcategories: ['Government Office Leakages', 'Public Washroom Repair', 'Electrical Wiring Issue']
      },
      'Other PWD Issues': {
        subcategories: ['Contractor Payments Dispute', 'Land Acquisition Compensation', 'Tender Delay']
      }
    }
  },
  pdd: {
    name: 'Power Development Department (PDD)',
    categories: {
      'Power Outage': {
        subcategories: ['Unscheduled Cuts', 'Voltage Fluctuation', 'Transformer Damage', 'Line Snag']
      },
      'Faulty Transformer': {
        subcategories: ['Delay in Replacement', 'Oil Leakage', 'Sparking Hazards']
      },
      'Billing Grievance': {
        subcategories: ['Excessive Billing', 'Faulty Meter Reading', 'Delay in Bill Delivery']
      },
      'New Connection Delay': {
        subcategories: ['Application Pending', 'Feasibility Report Delay', 'Security Deposit Refund']
      }
    }
  },
  phe: {
    name: 'Jal Shakti (PHE) Department',
    categories: {
      'Water Scarcity': {
        subcategories: ['Irregular Water Supply', 'Low Pressure Supply', 'Dry Borewells']
      },
      'Contaminated Water': {
        subcategories: ['Turbid Water', 'Sewage Mix-up', 'Bad Odor']
      },
      'Pipeline Leakage': {
        subcategories: ['Main Line Burst', 'Distribution Pipe Leakage', 'Unattended Pit']
      },
      'Billing Issue': {
        subcategories: ['Incorrect Charges', 'Connection Regularisation', 'Meter Rent Dispute']
      }
    }
  },
  health: {
    name: 'Health & Medical Education',
    categories: {
      'Hospital Facilities': {
        subcategories: ['Lack of Beds', 'Dirty Wards', 'Broken Equipment', 'No Ambulance Service']
      },
      'Staff Behaviour': {
        subcategories: ['Doctor Absentees', 'Rude Behavior', 'Bribe Solicitation']
      },
      'Medicine Availability': {
        subcategories: ['Essential Medicines Out of Stock', 'Generic Substitutions Only']
      },
      'Scheme Enrollment': {
        subcategories: ['Ayushman Bharat Card Processing', 'Free Treatment Denial']
      }
    }
  },
  edu: {
    name: 'School Education Department',
    categories: {
      'School Infrastructure': {
        subcategories: ['No Boundary Wall', 'Broken Desks', 'Lack of Drinking Water', 'No Toilets']
      },
      'Teacher Availability': {
        subcategories: ['Shortage of Staff', 'Teacher Absenteeism', 'Proxy Teachers']
      },
      'Mid-Day Meal Quality': {
        subcategories: ['Unhygienic Food', 'Insufficient Quantity', 'Substandard Ingredients']
      },
      'Scholarships': {
        subcategories: ['Delay in Disbursement', 'Wrong Account Transfer', 'Rejection without Reason']
      }
    }
  },
  revenue: {
    name: 'Revenue Department',
    categories: {
      'Land Records': {
        subcategories: ['Incorrect Mutation', 'Delay in Fard Issuance', 'Record Missing']
      },
      'Demarcation Delay': {
        subcategories: ['Surveyor Not Visiting', 'Boundary Disputes', 'Encroachment Check']
      },
      'Certificate Issuance': {
        subcategories: ['Domicile Certificate Delay', 'OBC/RBA/ST Certificate Delay', 'Income Certificate Issue']
      },
      'Staff Misconduct': {
        subcategories: ['Patwari Absentees', 'Demanding Unofficial Fees', 'Arbitrary Land Valuation']
      }
    }
  },
  municipality: {
    name: 'Housing & Urban Development',
    categories: {
      'Garbage Collection': {
        subcategories: ['No Door-to-Door Collection', 'Overflowing Dustbins', 'Illegal Dumping']
      },
      'Street Light Malfunction': {
        subcategories: ['Bulb Fused', 'Dark Streets', 'New Installation Request']
      },
      'Drainage Blockage': {
        subcategories: ['Overflowing Sewers', 'Open Manholes', 'Stagnant Water']
      },
      'Stray Animal Menace': {
        subcategories: ['Stray Dogs Bites', 'Cattle on Roads', 'Monkey Menace']
      }
    }
  },
  food: {
    name: 'Food, Civil Supplies & Consumer Affairs',
    categories: {
      'Ration Card Issue': {
        subcategories: ['Addition of Member Delay', 'Verification Pending', 'Category Change (APL to BPL)']
      },
      'Ration Quality': {
        subcategories: ['Adulterated Grain', 'Rotten Rice/Wheat', 'Missing Kerosene Allocation']
      },
      'Dealer Misbehaviour': {
        subcategories: ['Under-weighing', 'Short Supply', 'Shop Remains Closed', 'Overcharging']
      },
      'Black Marketing': {
        subcategories: ['Diversion of Ration Stock', 'Unauthorized Dealers Selling Government Ration']
      }
    }
  }
};

export default function CascadingSelect({ onChange, value = {} }) {
  const [selectedDept, setSelectedDept] = useState(value.department || '');
  const [selectedCategory, setSelectedCategory] = useState(value.category || '');
  const [selectedSubcategory, setSelectedSubcategory] = useState(value.subcategory || '');

  const availableCategories = selectedDept ? Object.keys(categoryHierarchy[selectedDept]?.categories || {}) : [];
  const availableSubcategories = (selectedDept && selectedCategory)
    ? categoryHierarchy[selectedDept]?.categories[selectedCategory]?.subcategories || []
    : [];

  useEffect(() => {
    onChange({
      department: selectedDept,
      departmentName: categoryHierarchy[selectedDept]?.name || '',
      category: selectedCategory,
      subcategory: selectedSubcategory
    });
  }, [selectedDept, selectedCategory, selectedSubcategory]);

  const handleDeptChange = (e) => {
    setSelectedDept(e.target.value);
    setSelectedCategory('');
    setSelectedSubcategory('');
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
    setSelectedSubcategory('');
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
      <div className="space-y-1">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase">Department</label>
        <select
          value={selectedDept}
          onChange={handleDeptChange}
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-750 text-slate-950 dark:text-slate-50 rounded-lg px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">Select Department</option>
          {Object.keys(categoryHierarchy).map((deptKey) => (
            <option key={deptKey} value={deptKey}>
              {categoryHierarchy[deptKey].name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase">Grievance Category</label>
        <select
          value={selectedCategory}
          onChange={handleCategoryChange}
          disabled={!selectedDept}
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-750 text-slate-950 dark:text-slate-50 rounded-lg px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <option value="">Select Category</option>
          {availableCategories.map((catName) => (
            <option key={catName} value={catName}>
              {catName}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase">Subcategory (Level 1)</label>
        <select
          value={selectedSubcategory}
          onChange={(e) => setSelectedSubcategory(e.target.value)}
          disabled={!selectedCategory}
          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-750 text-slate-950 dark:text-slate-50 rounded-lg px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          <option value="">Select Subcategory</option>
          {availableSubcategories.map((subcatName) => (
            <option key={subcatName} value={subcatName}>
              {subcatName}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

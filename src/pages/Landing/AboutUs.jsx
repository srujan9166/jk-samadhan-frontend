import React from 'react';

export default function AboutUs() {
  return (
    <section 
      id="about" 
      className="py-12 md:py-16 border-y border-slate-200 bg-[#eeeeee] text-left select-none font-sans"
    >
      <div className="max-w-7xl mx-auto px-6 md:px-8">
        
        {/* Title */}
        <h2 className="text-[22px] font-bold text-[#164581] uppercase tracking-tight mb-6">
          ABOUT JK SAMADHAN
        </h2>

        {/* Content Paragraphs */}
        <div className="space-y-5 text-[14px] leading-relaxed text-slate-800 font-normal">
          <p>
            Jammu &amp; Kashmir Unified Grievance Redressal &amp; Monitoring System (JK Samadhan) is an online platform available to the citizens 24x7 to lodge their grievances to the public authorities on any subject related to service delivery. It is a single portal connected to all the Ministries/Departments of Government of Jammu &amp; Kashmir and Districts. Every Department and District Nodal Officer has role-based access to this system. JK Samadhan is also accessible to the citizens through standalone mobile application downloadable through Google Play store and mobile application integrated with JK Raabita.
          </p>
          <p>
            The status of the grievance filed in JK Samadhan can be tracked with the unique registration ID provided at the time of registration of the complainant. JK Samadhan also provides appeal facility to the citizens if they are not satisfied with the resolution by the Grievance Officer. After closure of grievance if the complainant is not satisfied with the resolution, he/she can provide feedback. If the rating is 'Poor' the option to file an appeal is enabled. The status of the Appeal can also be tracked by the petitioner with the grievance registration number.
          </p>
        </div>

      </div>
    </section>
  );
}

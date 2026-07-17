import React, { useState } from 'react';
import { ChevronDown, HelpCircle, X } from 'lucide-react';

export default function FAQ({ isOpen, onClose }) {
  const [openIndex, setOpenIndex] = useState(0);

  const faqs = [
    {
      q: 'What are the contact details of Department of Public Grievances, J&K?',
      a: 'You can contact the Department of Public Grievances (DoPG), J&K through the following channels:\n\n• Helpline: Call 1905 (Toll-Free Helpline for filing and tracking grievances).\n• Jammu Office: Department of Public Grievances, Civil Secretariat, Jammu - 180001.\n• Kashmir Office: Department of Public Grievances, Church Lane, Sonwar, Srinagar - 190001.\n• Email: jk-grievance@jk.gov.in'
    },
    {
      q: 'Where can the grievances be registered/sent?',
      a: 'Grievances can be registered with the concern department online through Web Portal (https://samadhan.jk.gov.in), Mobile application (Android and iOS) as well as by post or by hand/in person, from the public and through Toll Free no. 1905.'
    },
    {
      q: 'How do I lodge the grievance?',
      a: 'To lodge a grievance online, follow these simple steps:\n\n1. Click "Registration" to register yourself using a valid mobile number, email address, and demographic details.\n2. Log in using your mobile number and password.\n3. Click "Lodge Grievance" from the dashboard.\n4. Select the concerned Administrative Department, District, and Subject category.\n5. Provide a detailed description of your grievance and upload supporting evidence if any (PDF, JPG, PNG up to 2MB).\n6. Click submit to receive a unique Grievance Reference Code on your mobile via SMS.'
    },
    {
      q: 'What happens when I lodge the grievance?',
      a: 'Once submitted, your grievance is instantly registered on the portal and assigned a unique Reference Code. The system automatically routes it to the designated Nodal Officer of the concerned Administrative Department or District. An acknowledgment SMS containing the Reference Code and department contact information is immediately dispatched to your registered mobile number.'
    },
    {
      q: 'How do I track my grievance?',
      a: 'You can track the status of your grievance at any time:\n\n• On the Homepage, click the "Track Grievance Status" button.\n• Enter your unique Grievance Reference Code and registered mobile number.\n• Click "Verify & Track" to see the step-by-step processing history, current officer comments, and final redressal resolution reports.'
    },
    {
      q: 'What happens to the grievances? How are the grievances dealt with?',
      a: 'All grievances are processed systematically:\n\n• The Departmental Nodal Officer reviews and forwards the grievance to the concerned field action officer.\n• The field officer conducts site inspection or audits relevant records to address the issue.\n• The field officer uploads a detailed Action Taken Report (ATR).\n• The Nodal Officer audits the response and, once satisfied, marks the grievance as resolved. A notification is then sent to the citizen.'
    },
    {
      q: 'After Redressal, can the grievance be re-opened for further correspondence about it having been closed without details etc.?',
      a: 'Yes. If you feel that your grievance has been closed without proper details, or if the action taken is unsatisfactory:\n\n• You can mark your resolution feedback rating as "Unsatisfactory" within the portal.\n• This action automatically flags the grievance for review by a senior audit authority.\n• The auditing officer can re-open the case and escalate it back to the department for mandatory review and further corrective action.'
    },
    {
      q: 'What are the types of grievances which are not taken up for Redressal by DoPG?',
      a: 'The following types of cases are excluded from redressal under DoPG guidelines:\n\n• Sub-judice cases or issues pending before any court of law.\n• Personal or family disputes, or disputes between private parties.\n• RTI (Right to Information) queries or matters under active legal inquiry.\n• Broad policy suggestions or requests for systemic policy changes.\n• Anonymous or extremely vague complaints lacking actionable details.\n• Messages containing abusive or offensive language.'
    }
  ];

  React.useEffect(() => {
    if (isOpen) {
      setOpenIndex(0);
    }
  }, [isOpen]);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto motion-modal-overlay ${
      isOpen
        ? 'opacity-100 pointer-events-auto bg-slate-900/60 backdrop-blur-sm visible'
        : 'opacity-0 pointer-events-none bg-transparent backdrop-blur-none invisible'
    }`}>
      <div className={`bg-white rounded-2xl shadow-2xl max-w-3xl w-full overflow-hidden motion-modal-content transform flex flex-col max-h-[90vh] ${
        isOpen ? 'scale-100 translate-y-0 opacity-100' : 'scale-95 translate-y-4 opacity-0'
      }`}>
        {/* Header */}
        <div className="bg-[#0c408f] text-white px-6 py-4 flex justify-between items-center relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gov-saffron via-white to-gov-green"></div>
          <div className="flex items-center gap-3 mt-1">
            <HelpCircle className="h-6 w-6 text-gov-saffron animate-pulse" />
            <div>
              <h3 className="font-display font-semibold text-lg text-white">Frequently Asked Questions</h3>
              <p className="text-xs text-slate-350">Official guidelines and answers regarding Citizen Grievances in J&K</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:16px_16px] bg-slate-50/30 text-left">
          {faqs.map((faq, index) => {
            const isOpenAccordion = openIndex === index;
            return (
              <div
                key={index}
                className="border border-slate-200/60 dark:border-slate-800 rounded-xl overflow-hidden transition-all duration-300 bg-white dark:bg-slate-900/40 hover:border-slate-350 dark:hover:border-slate-700 shadow-sm"
              >
                {/* Accordion Trigger */}
                <button
                  onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                  className="w-full flex justify-between items-start px-5 py-4 text-left font-semibold text-sm sm:text-base text-slate-850 dark:text-slate-200 hover:text-[#0c408f] dark:hover:text-white transition-colors cursor-pointer"
                >
                  <span className="flex items-start gap-3">
                    <HelpCircle className="h-4.5 w-4.5 text-[#13b183] flex-shrink-0 mt-0.5" />
                    <span className="leading-snug text-xs sm:text-sm">{faq.q}</span>
                  </span>
                  <ChevronDown className={`h-4.5 w-4.5 text-slate-400 transform transition-transform duration-300 flex-shrink-0 ml-4 mt-0.5 ${isOpenAccordion ? 'rotate-180 text-[#0c408f]' : ''
                    }`} />
                </button>

                {/* Accordion Content */}
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpenAccordion ? 'max-h-[500px] border-t border-slate-100 dark:border-slate-800' : 'max-h-0'
                    }`}
                >
                  <p className="px-5 py-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50/50 dark:bg-slate-950/20 whitespace-pre-line">
                    {faq.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-150 px-6 py-4 flex justify-between items-center text-xs text-slate-500">
          <span>Need further assistance? Call Toll-Free: <strong>1905</strong></span>
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-lg transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

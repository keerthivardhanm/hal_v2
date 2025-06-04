
"use client";

import type { ApprovalRequest } from "@/types";
import { format } from "date-fns";

interface ApprovalLetterProps {
  request: ApprovalRequest;
}

export function ApprovalLetter({ request }: ApprovalLetterProps) {
  const today = format(new Date(), "dd-MM-yyyy");
  const eventDate = request.requestDate
    ? format(request.requestDate.toDate(), "dd-MM-yyyy")
    : "N/A";
  const submittedAtDate = request.submittedAt
    ? format(request.submittedAt.toDate(), "dd-MM-yyyy 'at' HH:mm")
    : "N/A";

  const approverGM = request.approvals.find((a) => a.level === 1); // Assuming GM is Level 1
  const approverDGM = request.approvals.find((a) => a.level === 2); // Assuming DGM is Level 2
  const approverSM = request.approvals.find((a) => a.level === 3); // Assuming SM is Level 3


  return (
    <div className="p-8 bg-white text-black font-serif text-xs print-letter-container">
      <header className="flex justify-between items-start mb-6">
        <div>
          <p className="font-bold">OFFICE OF DGM (IT)</p>
        </div>
        <div className="text-right">
          <p className="font-bold">OVERHAUL DIVISION</p>
          <p>HAL(BC)</p>
          <p>{today}</p>
        </div>
      </header>

      <section className="mb-4 border-b border-black pb-2">
        <h2 className="font-bold text-center text-sm underline mb-2">APPROVAL REQUEST OVERVIEW</h2>
        <div className="grid grid-cols-2 gap-x-4">
          <p><strong>Tracking ID:</strong> {request.id}</p>
          <p><strong>Current Status:</strong> {request.status}</p>
        </div>
      </section>
      
      <section className="mb-4 border-b border-black pb-2">
         <h3 className="font-bold text-sm mb-1">Submitter Information:</h3>
        <p><strong>Name:</strong> {request.submitterName}</p>
        <p><strong>Email:</strong> {request.submitterEmail}</p>
        <p><strong>Organisation:</strong> {request.organisationName}</p>
        <p><strong>ID No:</strong> {request.submitterIdNo}</p>
        <p><strong>Submitted At:</strong> {submittedAtDate}</p>
      </section>

      <section className="mb-4 border-b border-black pb-2">
        <h3 className="font-bold text-sm mb-1">Request Details:</h3>
        <p className="mb-1"><strong>Purpose of Visit:</strong> {request.purpose}</p>
        <p><strong>Requested Date for Visit:</strong> {eventDate}</p>
        <p><strong>Requested Time for Visit:</strong> {request.requestTime}</p>
        <p><strong>Number of Items:</strong> {request.numberOfItems}</p>
      </section>

      <section className="mb-4">
        <p className="mb-1">TO CM(SECURITY)-O</p>
        <p className="font-bold mb-2">
          SUB: PERMISSION FOR {request.finalSelectedGadgets.join(", ").toUpperCase()} TO BRING INSIDE OVERHAUL DIVISION
        </p>
        <p className="mb-2 leading-relaxed">
          Mr/Mrs {request.submitterName} from {request.organisationName} (Overhaul Division) is visiting
          HAL on {eventDate} at {request.requestTime} for {request.purpose}. In this
          connection, He/She may be allowed to carry {request.finalSelectedGadgets.join(", ")}
          {" "}as per the details given below.
        </p>
      </section>

      <section className="mb-4">
        <h2 className="font-bold text-center mb-2 text-sm underline">MOBILE & LAPTOP DETAILS</h2>
        <table className="w-full border-collapse border border-black text-xs">
          <thead>
            <tr>
              <th className="border border-black p-1 font-bold w-[15%]">No.of items</th>
              <th className="border border-black p-1 font-bold w-[40%]">Model Number & Serial No.</th>
              <th className="border border-black p-1 font-bold w-[20%]">MAKE</th>
              <th className="border border-black p-1 font-bold w-[25%]">Name of the Person Carrying</th>
            </tr>
          </thead>
          <tbody>
            {request.finalSelectedGadgets.length > 0 ? (
              request.finalSelectedGadgets.map((gadget, index) => (
                <tr key={index}>
                  <td className="border border-black p-1 text-center h-8">
                    {index === 0 ? request.numberOfItems : ""}
                  </td>
                  <td className="border border-black p-1 h-8">
                    {gadget} (Serial No. _________________)
                  </td>
                  <td className="border border-black p-1 h-8 text-center">_________________</td>
                  <td className="border border-black p-1 text-center h-8">
                    {request.submitterName}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="border border-black p-1 text-center h-8">No gadgets specified.</td>
              </tr>
            )}
             {request.finalSelectedGadgets.some(g => g.toLowerCase().includes("adaptor") || g.toLowerCase().includes("console cable")) && (
                 <tr>
                    <td className="border border-black p-1 text-center h-8"></td>
                    <td className="border border-black p-1 h-8">Adaptor & console cable-1</td>
                    <td className="border border-black p-1 h-8 text-center">Smart Phone</td>
                    <td className="border border-black p-1 text-center h-8">{request.submitterName}</td>
                </tr>
            )}
             {request.finalSelectedGadgets.some(g => g.toLowerCase().includes("tool kit")) && (
                 <tr>
                    <td className="border border-black p-1 text-center h-8"></td>
                    <td className="border border-black p-1 h-8">Tool kit- 1 set</td>
                    <td className="border border-black p-1 h-8 text-center"></td>
                    <td className="border border-black p-1 text-center h-8">{request.submitterName}</td>
                </tr>
            )}
          </tbody>
        </table>
      </section>
      
      <section className="mb-4 border-t border-black pt-2">
        <h3 className="font-bold text-sm mb-1 underline">Approval Log:</h3>
        {request.approvals.length > 0 ? (
          <ul className="list-disc list-inside pl-2 space-y-1 text-xs">
            {request.approvals.sort((a, b) => a.level - b.level).map(appr => (
              <li key={appr.adminUid + appr.level}>
                Level {appr.level} Approved by {appr.adminEmail} on {appr.approvedAt && appr.approvedAt.toDate ? format(appr.approvedAt.toDate(), 'PPp') : 'Processing...'}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-xs">No approvals recorded yet.</p>
        )}
      </section>

      {request.isRejected && request.rejectionReason && (
        <section className="mb-4 border-t border-black pt-2">
          <h3 className="font-bold text-sm mb-1 underline text-red-600">Rejection Information:</h3>
          <p className="text-xs text-red-600"><strong>Reason:</strong> {request.rejectionReason}</p>
        </section>
      )}

      <section className="my-6">
        <p className="font-bold">NOTE: Camera is to be blocked</p>
      </section>

      <footer className="flex justify-between items-end pt-10 mt-10">
        <div className="text-center">
          <p className="mb-2 h-6">{approverGM ? "(Approved)" : "(__________________)"}</p>
          <p className="font-bold">GM ( O )</p>
        </div>
        <div className="text-center">
          <p className="mb-2 h-6">{approverDGM ? "(Approved)" : "(__________________)"}</p>
          <p className="font-bold">DGM</p>
        </div>
        <div className="text-center">
          <p className="mb-2 h-6">{approverSM ? "(Approved)" : "(__________________)"}</p>
          <p className="font-bold">SM(IT)</p>
        </div>
      </footer>
    </div>
  );
}

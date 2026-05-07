import React from "react";
import {
  getDocumentStatus,
  getDaysToExpiry,
} from "../features/documents/documentTypes";

const mockDocuments = [
  {
    id: 1,
    name: "إقامة الموظف",
    owner: "محمد أحمد",
    expiryDate: "2026-06-15",
  },
  {
    id: 2,
    name: "استمارة السيارة",
    owner: "سيارة فورد",
    expiryDate: "2026-05-05",
  },
  {
    id: 3,
    name: "السجل التجاري",
    owner: "شركة نبني",
    expiryDate: "2026-04-20",
  },
];

export default function DocumentsCenter() {
  return (
    <div style={{ padding: 24 }}>
      <h1>مركز المستندات</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
          gap: 16,
          marginTop: 20,
        }}
      >
        {mockDocuments.map((doc) => {
          const status = getDocumentStatus(doc.expiryDate);
          const days = getDaysToExpiry(doc.expiryDate);

          return (
            <div
              key={doc.id}
              style={{
                border: "1px solid #ddd",
                borderRadius: 12,
                padding: 16,
                background: "#fff",
              }}
            >
              <h3>{doc.name}</h3>

              <p>{doc.owner}</p>

              <p>
                تاريخ الانتهاء:
                {" "}
                {doc.expiryDate}
              </p>

              <p>
                متبقي:
                {" "}
                {days}
                {" "}
                يوم
              </p>

              <div
                style={{
                  marginTop: 12,
                  padding: "6px 12px",
                  borderRadius: 8,
                  background:
                    status === "expired"
                      ? "#ff4d4f"
                      : status === "critical"
                      ? "#fa8c16"
                      : status === "warning"
                      ? "#fadb14"
                      : "#52c41a",
                  color: "#fff",
                  width: "fit-content",
                }}
              >
                {status}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
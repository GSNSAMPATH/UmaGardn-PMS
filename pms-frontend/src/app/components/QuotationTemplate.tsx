"use client";

import { useEffect, useState } from "react";

export default function QuotationTemplate({
  quotation,
}: {
  quotation: any;
}) {
  const [html, setHtml] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/quatation-html",
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify(
              quotation,
            ),
          }
        );

        const data = await res.json();

        if (!mounted) return;

        setHtml(data.html || "");
      } catch (err) {
        console.error(err);

        if (!mounted) return;

        setHtml("");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [quotation]);

  if (loading) {
    return (
      <div className="p-6 text-sm text-gray-600">
        Loading quotation...
      </div>
    );
  }

  return (
    <div
      dangerouslySetInnerHTML={{
        __html: html,
      }}
    />
  );
}
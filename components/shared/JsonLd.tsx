import React from 'react';

interface JsonLdProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: Record<string, any>;
  id?: string;
}

/**
 * JsonLd component renders safe Schema.org JSON-LD scripts into the head or body.
 * Compatible with SSR and Next.js App Router streaming.
 */
export function JsonLd({ schema, id }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      id={id}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

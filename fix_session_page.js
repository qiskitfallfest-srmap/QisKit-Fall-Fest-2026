const fs = require('fs');
let content = fs.readFileSync('app/learning/session/[id]/page.tsx', 'utf-8');

if (!content.includes('useSearchParams')) {
  content = content.replace(
    /import { useParams, useRouter } from 'next\/navigation';/,
    "import { useParams, useRouter, useSearchParams } from 'next/navigation';"
  );
}

content = content.replace(
  /const router = useRouter\(\);/,
  "const router = useRouter();\n  const searchParams = useSearchParams();"
);

content = content.replace(
  /useEffect\(\(\) => \{\n\s*fetchSessionProgress\(\);\n\s*\}, \[sessionId\]\);/,
  `useEffect(() => {
    fetchSessionProgress();
  }, [sessionId]);

  useEffect(() => {
    if (searchParams.get('quiz') === 'true' && quiz) {
      setIsQuizOpen(true);
    } else {
      setIsQuizOpen(false);
    }
  }, [searchParams, quiz]);`
);

fs.writeFileSync('app/learning/session/[id]/page.tsx', content);

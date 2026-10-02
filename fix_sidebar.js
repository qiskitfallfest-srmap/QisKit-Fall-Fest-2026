const fs = require('fs');
let content = fs.readFileSync('components/learning/LearningSidebar.tsx', 'utf-8');

const replacement = `
                  {sessions.map((session) => {
                    const isActive = activeSessionId === session.id;
                    const isQuizActive = isActive && searchParams?.get('quiz') === 'true';
                    const isJustSessionActive = isActive && !isQuizActive;

                    return (
                      <div key={session.id} className="flex flex-col mb-1">
                        <Link
                          href={\`/learning?session=\${session.id}\`}
                          className={clsx(
                            'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors',
                            isJustSessionActive
                              ? 'bg-burgundy/10 text-burgundy font-semibold'
                              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 font-medium'
                          )}
                        >
                          <PlayCircle className={clsx('w-3.5 h-3.5', isJustSessionActive ? 'text-burgundy' : 'text-slate-400')} />
                          <span className="line-clamp-1">{session.title}</span>
                        </Link>
                        
                        <Link
                          href={\`/learning?session=\${session.id}&quiz=true\`}
                          className={clsx(
                            'flex items-center gap-2.5 px-3 py-1.5 ml-4 mt-0.5 rounded-md text-xs transition-colors',
                            isQuizActive
                              ? 'bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100'
                              : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                          )}
                        >
                          <Award className={clsx('w-3 h-3', isQuizActive ? 'text-emerald-600' : 'text-slate-400')} />
                          <span className="line-clamp-1">Concept Quiz</span>
                        </Link>
                      </div>
                    );
                  })}
`;

content = content.replace(/\{sessions\.map\(\(session\) => \{[\s\S]*?\}\)\}/, replacement.trim());
fs.writeFileSync('components/learning/LearningSidebar.tsx', content);

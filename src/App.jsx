import { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbwHvwAM7m1RLssx-hMdKUw4BcBTmG8DzuvMzghhDC-9jtC17sDZnRTvDl-Cwyfwjq0W/exec';

const SCREENS = { INTRO: 'intro', PART0: 'part0', PART1: 'part1', EMAIL: 'email', LOADING: 'loading', FREE_RESULT: 'free_result', PAID_RESULT: 'paid_result' };

const PART0_Qs = [
  { text: '우리 집에서는 감정을 자유롭게 표현할 수 있는 분위기였다' },
  { text: '부모님이 자주 다투셨다' },
  { text: '나는 집에서 있는 그대로의 나로 있을 수 있었다' },
  { text: '부모님 사이의 관계가 안정적이라고 느꼈다' },
  { text: '어릴 때 스스로 결정할 수 있는 것들이 충분히 있었다' },
];

const DIMS = [
  { id: 'd1', name: '방어기제', icon: '🛡️', color: '#CE93D8', qs: ['불편한 감정이 생기면 논리적으로 설명하며 덮어버리는 편이다', '내가 얼마나 상처받았는지 한참 지나서야 알아차리는 경우가 많다', '힘든 상황이 생기면 피하거나 외면하는 편이다', '속으로는 힘들어도 겉으로는 괜찮은 척을 습관적으로 하는 편이다'] },
  { id: 'd2', name: '애착유형', icon: '💞', color: '#F48FB1', qs: ['안정적으로 잘 대해주는 사람보다 불규칙하게 나를 설레게 하는 사람에게 더 끌리는 경향이 있다', '상대가 날 떠날까봐 자주 불안하거나 반대로 관계가 가까워질수록 도망치고 싶어진다', '나에게 진심으로 잘 대해주는 사람이 오히려 의심스럽거나 어색하게 느껴진다', '사람들이 너무 가까이 다가오면 불편해서 거리를 두고 싶어진다'] },
  { id: 'd3', name: '인지왜곡', icon: '🧩', color: '#80DEEA', qs: ['한 번 실패하거나 거절당하면 나는 원래 이런 사람이야로 확대 해석하는 경향이 있다', '칭찬을 받아도 자연스럽게 받아들이기 어렵고 의심되거나 불편하다', '내 생각 감정 외모 행동 등 작은 부분까지 과도하게 비판하는 편이다', '내 자존감은 주로 다른 사람이 나를 어떻게 생각하느냐에 달려 있다'] },
  { id: 'd4', name: '회복탄력성', icon: '⚡', color: '#A5D6A7', qs: ['힘든 일이 있을 때 어떻게 하면 나아질까보다 왜 나한테 이런 일이에 더 오래 머문다', '기분 상태가 바뀌면 하던 계획이나 루틴이 완전히 무너지는 경우가 많다', '새로운 것을 시도하기 전에 잘 못하면 어떡하지라는 두려움이 먼저 온다', '감정이 격해지면 차분하게 생각하는 것이 매우 어렵다'] },
  { id: 'd5', name: '신체신호', icon: '🫀', color: '#FFAB91', qs: ['특정 가족과 대화하거나 연락받은 후 몸이 긴장되거나 피로감 두통 등이 나타난다', '누군가 나에게 불만이 있을 것 같으면 마음속에서 쉽게 털어내지 못한다', '비판이나 지적을 받으면 감정적으로 강하게 반응하는 편이다', '상처받거나 배신당한 감정을 오래 품고 있는 편이다'] },
  { id: 'd6', name: '과도한통제', icon: '🎯', color: '#FFD54F', qs: ['내가 충분히 노력하면 대부분의 문제를 해결할 수 있다고 믿어서 혼자 다 짊어지는 편이다', '내가 나서지 않으면 일이 잘못될 것 같아 남에게 맡기거나 의지하는 것이 어렵다', '모든 것이 내 통제 범위 안에 있을 때만 비로소 마음이 놓인다', '타인의 문제를 해결해주고 싶은 충동을 자주 느끼고 실제로 나서는 편이다'] },
  { id: 'd7', name: '자책죄책감', icon: '🔗', color: '#EF9A9A', qs: ['가족 중 누군가가 화내거나 기분이 나쁠 때 그것이 어쩐지 내 탓인 것 같다는 생각이 든다', '가족 안에서 생긴 문제를 내가 해결해야 한다는 부담을 느꼈거나 느낀다', '가족을 위해 더 해야 했는데 못 했다는 죄책감이 자주 올라온다', '가족의 기대에 부응하지 못할 때 지나치게 자책하는 편이다'] },
];

const OPTS = [{ label: '거의 없다', value: 1 },{ label: '가끔 그렇다', value: 2 },{ label: '종종 그렇다', value: 3 },{ label: '자주 그렇다', value: 4 },{ label: '항상 그렇다', value: 5 }];
const P0_OPTS = [{ label: '전혀 아니다', value: 1 },{ label: '아니다', value: 2 },{ label: '보통이다', value: 3 },{ label: '그렇다', value: 4 },{ label: '매우 그렇다', value: 5 }];
const CHECKLIST = ['잘 대해주는 사람보다 나를 힘들게 하는 사람에게 더 오래 마음이 간다', '화가 나도 참고 나중에 혼자 삭히는 경우가 더 많다', '내가 뭘 잘못한 것도 아닌데 왜인지 자꾸 미안해진다', '충분히 잘하고 있는데도 늘 부족한 것 같은 기분이 든다', '가까워질수록 불안하거나 아예 거리를 두고 싶어진다', '나를 위한 선택을 하면 죄책감이 올라온다'];

function getType(t) {
  if (t <= 70) return { type: '초록불', color: '#66BB6A', bg: 'rgba(46,125,50,0.15)', border: '#388E3C', emoji: '🟢', detail: '경제 독립 집중형' };
  if (t <= 105) return { type: '노란불', color: '#FFA726', bg: 'rgba(230,81,0,0.15)', border: '#E65100', emoji: '🟡', detail: '경계선 회복형' };
  return { type: '빨간불', color: '#EF5350', bg: 'rgba(183,28,28,0.15)', border: '#B71C1C', emoji: '🔴', detail: '자아 재건형' };
}
function getLev(s) {
  if (s <= 8) return { label: '낮음', color: '#66BB6A' };
  if (s <= 12) return { label: '보통', color: '#FFA726' };
  if (s <= 16) return { label: '높음', color: '#FF7043' };
  return { label: '매우 높음', color: '#EF5350' };
}
function calcScores(answers) {
  const dimScores = DIMS.map(dim => ({ id: dim.id, name: dim.name, icon: dim.icon, color: dim.color, score: dim.qs.reduce((sum, _, qi) => sum + (answers[dim.id + '_' + qi] || 0), 0), max: dim.qs.length * 5 }));
  return { dimScores, total: dimScores.reduce((s, d) => s + d.score, 0) };
}
function getScoreCopy(total) {
  if (total <= 70) return { hook: '점수는 낮아도, 이 테스트를 시작한 이유가 있었을 거예요.', body: '아무 이유 없이 심리 독립 테스트를 클릭한 건 아니었겠죠.\n마음 한켠에 여전히 뭔가 걸리는 게 있다면, 그게 바로 지금 봐야 할 것일 수 있어요.\n\n심층 분석은 낮은 점수 안에 숨어있는 작은 균열을 짚어드려요.\n균열은 지금 작을 때 보는 게 맞아요.' };
  if (total <= 105) return { hook: '지금 당신은 회복의 경계선에 있어요.', body: '이 점수대가 사실 가장 위험해요.\n나쁘지 않네라고 넘어가기엔 패턴이 조용히 관계와 돈에 영향을 주고,\n심각하다고 느끼기엔 일상이 굴러가거든요.\n\n지금 이 패턴을 정확히 보지 않으면 3년 후에도 같은 자리예요.' };
  return { hook: '이 점수는 혼자 감당하기엔 꽤 무거운 패턴들이에요.', body: '나쁜 게 아니에요. 오래 버텨온 거예요.\n\n근데 이 패턴들, 방치하면 관계에서 돈에서 건강에서 계속 같은 방식으로 반복돼요.\n\n지금 딱 한 번만 제대로 들여다보면 그 반복의 고리를 끊을 수 있어요. 21일이면 돼요.' };
}
function useTimer(startTime) {
  const [remaining, setRemaining] = useState(3600);
  useEffect(() => {
    if (!startTime) return;
    const iv = setInterval(() => { setRemaining(Math.max(0, 3600 - Math.floor((Date.now() - startTime) / 1000))); }, 1000);
    return () => clearInterval(iv);
  }, [startTime]);
  const m = String(Math.floor(remaining / 60)).padStart(2, '0');
  const s = String(remaining % 60).padStart(2, '0');
  return { display: m + ':' + s, expired: remaining === 0 };
}
async function sendToSheet(payload) {
  try { await fetch(SHEET_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }); } catch (e) { console.log('sheet error', e); }
}

const page = { minHeight: '100vh', background: 'linear-gradient(155deg,#0D0020 0%,#1A0535 40%,#2D1060 100%)', fontFamily: 'Pretendard,Apple SD Gothic Neo,sans-serif', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' };
const wrap = { width: '100%', maxWidth: '560px' };
const primaryBtn = { width: '100%', background: 'linear-gradient(135deg,#6A1B9A,#9C27B0)', border: 'none', borderRadius: '14px', padding: '18px', fontSize: '16px', fontWeight: 700, color: '#fff', cursor: 'pointer' };
const ghostBtn = { width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '12px', padding: '13px', color: 'rgba(255,255,255,0.5)', fontSize: '13px', cursor: 'pointer', marginTop: '12px' };
const inputStyle = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(206,147,216,0.3)', borderRadius: '10px', padding: '13px 16px', color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' };
function cardStyle(anim) { return { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(206,147,216,0.2)', borderRadius: '20px', padding: '28px', marginBottom: '20px', opacity: anim ? 0 : 1, transform: anim ? 'translateY(8px)' : 'translateY(0)', transition: 'all 0.3s' }; }
function btnStyle(active, color) { color = color || '#CE93D8'; return { background: active ? 'rgba(206,147,216,0.18)' : 'rgba(255,255,255,0.04)', border: '1.5px solid ' + (active ? color : 'rgba(255,255,255,0.12)'), borderRadius: '12px', padding: '14px 18px', textAlign: 'left', color: active ? '#fff' : 'rgba(255,255,255,0.75)', fontSize: '14.5px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }; }
function circleStyle(active, color) { color = color || '#CE93D8'; return { width: '22px', height: '22px', borderRadius: '50%', border: '2px solid ' + (active ? color : 'rgba(255,255,255,0.3)'), background: active ? color : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px' }; }
function barStyle(pct, color) { color = color || '#CE93D8'; return { height: '100%', width: pct + '%', background: 'linear-gradient(90deg,' + color + ',#9C27B0)', borderRadius: '2px', transition: 'width 0.4s' }; }

export default function PsychTest() {
  const [screen, setScreen] = useState(SCREENS.INTRO);
  const [p0Answers, setP0Answers] = useState({});
  const [p0Idx, setP0Idx] = useState(0);
  const [dimIdx, setDimIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [email, setEmail] = useState('');
  const [nick, setNick] = useState('');
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [isAnim, setIsAnim] = useState(false);
  const [selOpt, setSelOpt] = useState(null);
  const [scores, setScores] = useState(null);
  const [aiLetter, setAiLetter] = useState('');
  const [resultStartTime, setResultStartTime] = useState(null);
  const [checkedItems, setCheckedItems] = useState([]);
  const [copied, setCopied] = useState(false);
  const timer = useTimer(resultStartTime);
  const totalQs = DIMS.reduce((a, d) => a + d.qs.length, 0);
  const answeredCount = Object.keys(answers).length;
  const progress = screen === SCREENS.PART1 ? ((dimIdx * 4 + qIdx) / totalQs) * 100 : 0;

  function animate(fn) { setIsAnim(true); setTimeout(() => { fn(); setIsAnim(false); setSelOpt(null); }, 280); }
  function reset() { setScreen(SCREENS.INTRO); setAnswers({}); setP0Answers({}); setP0Idx(0); setDimIdx(0); setQIdx(0); setEmail(''); setNick(''); setAiLetter(''); setScores(null); setResultStartTime(null); setCheckedItems([]); setCopied(false); }
  function goBack() {
    if (screen === SCREENS.PART0) { if (p0Idx > 0) { setP0Idx(p0Idx - 1); setSelOpt(null); } else setScreen(SCREENS.INTRO); }
    else if (screen === SCREENS.PART1) { if (qIdx > 0) { setQIdx(qIdx - 1); setSelOpt(null); } else if (dimIdx > 0) { setDimIdx(dimIdx - 1); setQIdx(DIMS[dimIdx - 1].qs.length - 1); setSelOpt(null); } else { setScreen(SCREENS.PART0); setP0Idx(PART0_Qs.length - 1); } }
    else if (screen === SCREENS.EMAIL) { setScreen(SCREENS.PART1); setDimIdx(DIMS.length - 1); setQIdx(DIMS[DIMS.length - 1].qs.length - 1); }
  }
  function handleP0Select(val) { setSelOpt(val); setTimeout(() => { setP0Answers(prev => Object.assign({}, prev, { ['p0_' + p0Idx]: val })); animate(() => { if (p0Idx < PART0_Qs.length - 1) setP0Idx(p0Idx + 1); else setScreen(SCREENS.PART1); }); }, 150); }
  function handleMainSelect(val) { setSelOpt(val); const key = DIMS[dimIdx].id + '_' + qIdx; setTimeout(() => { setAnswers(prev => Object.assign({}, prev, { [key]: val })); animate(() => { if (qIdx < DIMS[dimIdx].qs.length - 1) setQIdx(qIdx + 1); else if (dimIdx < DIMS.length - 1) { setDimIdx(dimIdx + 1); setQIdx(0); } else setScreen(SCREENS.EMAIL); }); }, 150); }

  function copyScores() {
    if (!scores) return;
    const ti = getType(scores.total);
    const sorted = [...scores.dimScores].sort((a, b) => b.score - a.score);
    const text = '[' + (nick || '익명') + '] 심리 독립 테스트 결과\n유형: ' + ti.emoji + ' ' + ti.type + ' (' + ti.detail + ')\n총점: ' + scores.total + '/140\n\n' + sorted.map(d => d.icon + ' ' + d.name + ': ' + d.score + '/20 (' + getLev(d.score).label + ')').join('\n');
    if (navigator.clipboard) { navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); }); }
    else { const el = document.createElement('textarea'); el.value = text; document.body.appendChild(el); el.select(); document.execCommand('copy'); document.body.removeChild(el); setCopied(true); setTimeout(() => setCopied(false), 2500); }
  }

  async function handleSubmit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setEmailError('올바른 이메일 주소를 입력해주세요'); return; }
    setEmailError('');
    const s = calcScores(answers);
    setScores(s);
    setScreen(SCREENS.LOADING);
    const ti = getType(s.total);
    const payload = { nick: nick || '익명', email, marketing: marketingConsent ? '동의' : '미동의', total: s.total, type: ti.type + ' ' + ti.detail, 방어기제: s.dimScores.find(d => d.id === 'd1').score, 애착유형: s.dimScores.find(d => d.id === 'd2').score, 인지왜곡: s.dimScores.find(d => d.id === 'd3').score, 회복탄력성: s.dimScores.find(d => d.id === 'd4').score, 신체신호: s.dimScores.find(d => d.id === 'd5').score, 과도한통제: s.dimScores.find(d => d.id === 'd6').score, 자책죄책감: s.dimScores.find(d => d.id === 'd7').score };
    PART0_Qs.forEach((_, i) => { payload['성장환경' + (i + 1)] = p0Answers['p0_' + i] || 0; });
    DIMS.forEach(d => { d.qs.forEach((_, i) => { payload[d.name + (i + 1)] = answers[d.id + '_' + i] || 0; }); });
    sendToSheet(payload);
    const topDims = [...s.dimScores].sort((a, b) => b.score - a.score).slice(0, 2);
    const prompt = '당신은 자기계발 콘텐츠 작가 라온단미입니다. 역기능 가족 환경에서 자란 사람을 위한 따뜻하고 정확한 맞춤 편지를 200자 내외 편지체로 작성해주세요.\n닉네임: ' + (nick || '당신') + '\n유형: ' + ti.type + ' ' + ti.detail + ' 총점: ' + s.total + '/140\n주요 패턴: ' + topDims.map(d => d.name + ' ' + d.score + '점').join(', ') + '\n\n1.닉네임으로 시작 2.패턴을 행동/감정으로 표현 3.따뜻하게 원인 한 문장 4.오늘 바로 할 구체적 행동 하나 5.응원 마무리\n주의: 의학용어 금지. 자기계발 코칭 톤.';
    try { const res = await fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 1000, messages: [{ role: 'user', content: prompt }] }) }); const data = await res.json(); setAiLetter((data.content && data.content[0] && data.content[0].text) || ''); }
    catch (e) { setAiLetter((nick || '당신') + '님, 결과를 바탕으로 맞춤 가이드레터를 준비하고 있습니다.\n\n당신의 오늘을 응원합니다. — 라온단미'); }
    setResultStartTime(Date.now());
    setScreen(SCREENS.FREE_RESULT);
  }

  return (
    <div style={page}>
      <div style={wrap}>

        {screen === SCREENS.INTRO && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '11px', letterSpacing: '4px', color: '#CE93D8', textTransform: 'uppercase', marginBottom: '14px' }}>라온단미 · 심리 독립 테스트</div>
              <h1 style={{ fontSize: 'clamp(24px,5vw,32px)', fontWeight: 900, lineHeight: 1.2, marginBottom: '10px' }}>나는 왜 이럴까,<br />한 번쯤 생각해본 적 있나요?</h1>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
              {CHECKLIST.map((item, i) => (
                <div key={i} onClick={() => setCheckedItems(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i])} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', background: checkedItems.includes(i) ? 'rgba(206,147,216,0.12)' : 'rgba(255,255,255,0.03)', border: '1.5px solid ' + (checkedItems.includes(i) ? 'rgba(206,147,216,0.5)' : 'rgba(255,255,255,0.08)'), borderRadius: '12px', padding: '14px 16px', cursor: 'pointer' }}>
                  <div style={{ width: '20px', height: '20px', borderRadius: '6px', border: '2px solid ' + (checkedItems.includes(i) ? '#CE93D8' : 'rgba(255,255,255,0.25)'), background: checkedItems.includes(i) ? '#CE93D8' : 'transparent', flexShrink: 0, marginTop: '1px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>{checkedItems.includes(i) ? '✓' : ''}</div>
                  <span style={{ fontSize: '14px', color: checkedItems.includes(i) ? '#fff' : 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>{item}</span>
                </div>
              ))}
            </div>
            <div style={{ background: 'rgba(206,147,216,0.08)', border: '1px solid rgba(206,147,216,0.2)', borderRadius: '16px', padding: '20px 22px', marginBottom: '24px', textAlign: 'center' }}>
              <p style={{ fontSize: '15px', lineHeight: 1.85, color: 'rgba(255,255,255,0.85)' }}>
                {checkedItems.length === 0 && '하나라도 내 얘기다 싶은 게 있다면'}
                {checkedItems.length >= 1 && checkedItems.length <= 2 && checkedItems.length + '가지가 마음에 걸렸군요.'}
                {checkedItems.length >= 3 && checkedItems.length <= 4 && checkedItems.length + '가지나 해당됐군요.'}
                {checkedItems.length >= 5 && '거의 모든 항목이 해당됐군요.'}
              </p>
              <p style={{ fontSize: '15px', lineHeight: 1.85, color: 'rgba(255,255,255,0.85)', marginTop: '8px' }}>그건 의지가 약해서도, 성격이 이상해서도 아니에요.<br /><strong style={{ color: '#CE93D8' }}>오래된 패턴이 지금도 작동하고 있는 거예요.</strong></p>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginTop: '12px', lineHeight: 1.7 }}>어디서 시작됐는지, 지금 나에게 어떻게 남아있는지<br />8분이면 파악할 수 있어요.</p>
            </div>
            <button style={primaryBtn} onClick={() => setScreen(SCREENS.PART0)}>지금 바로 확인하기 →</button>
            <div style={{ marginTop: '20px', padding: '14px 16px', background: 'rgba(255,200,0,0.05)', border: '1px solid rgba(255,200,0,0.15)', borderRadius: '10px', fontSize: '11.5px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.7 }}>⚠️ 이 테스트는 심리 패턴 파악을 위한 자기계발 도구입니다. 의료적 진단 및 전문 심리상담을 대체하지 않습니다.</div>
          </div>
        )}

        {screen === SCREENS.PART0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <button onClick={goBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '20px', padding: '0' }}>←</button>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ fontSize: '12px', color: '#CE93D8', letterSpacing: '2px' }}>성장 환경 체크</span><span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{p0Idx + 1} / {PART0_Qs.length}</span></div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}><div style={barStyle(((p0Idx + 1) / PART0_Qs.length) * 100)} /></div>
              </div>
            </div>
            <div style={cardStyle(isAnim)}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '14px' }}>어린 시절을 기준으로 답해주세요</div>
              <div style={{ fontSize: 'clamp(16px,3.5vw,19px)', fontWeight: 600, lineHeight: 1.65 }}>{PART0_Qs[p0Idx].text}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {P0_OPTS.map(opt => (<button key={opt.value} style={btnStyle(selOpt === opt.value)} onClick={() => handleP0Select(opt.value)}><span style={circleStyle(selOpt === opt.value)}>{selOpt === opt.value ? '✓' : ''}</span>{opt.label}</button>))}
            </div>
          </div>
        )}

        {screen === SCREENS.PART1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <button onClick={goBack} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '20px', padding: '0' }}>←</button>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}><span style={{ fontSize: '12px', color: '#CE93D8', letterSpacing: '2px' }}>{answeredCount + 1} / {totalQs}</span><span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{Math.round(progress)}%</span></div>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}><div style={barStyle(progress, DIMS[dimIdx].color)} /></div>
              </div>
            </div>
            <div style={cardStyle(isAnim)}>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', marginBottom: '14px' }}>현재를 기준으로 솔직하게 답해주세요</div>
              <div style={{ fontSize: 'clamp(15px,3.5vw,18px)', fontWeight: 600, lineHeight: 1.75 }}>{DIMS[dimIdx].qs[qIdx]}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {OPTS.map(opt => (<button key={opt.value} style={btnStyle(selOpt === opt.value, DIMS[dimIdx].color)} onClick={() => handleMainSelect(opt.value)}><span style={circleStyle(selOpt === opt.value, DIMS[dimIdx].color)}>{selOpt === opt.value ? '✓' : ''}</span>{opt.label}</button>))}
            </div>
            <div style={{ marginTop: '18px', display: 'flex', gap: '6px' }}>{DIMS.map((d, i) => <div key={d.id} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i < dimIdx ? d.color : i === dimIdx ? d.color + '66' : 'rgba(255,255,255,0.1)' }} />)}</div>
          </div>
        )}

        {screen === SCREENS.EMAIL && (
          <div style={{ textAlign: 'center' }}>
            <button onClick={goBack} style={Object.assign({}, ghostBtn, { width: 'auto', padding: '8px 16px', marginBottom: '20px', marginTop: 0 })}>← 이전 질문으로</button>
            <div style={{ fontSize: '42px', marginBottom: '14px' }}>✅</div>
            <h2 style={{ fontSize: '22px', fontWeight: 800, marginBottom: '6px' }}>33문항 완료!</h2>
            <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '24px', lineHeight: 1.7, fontSize: '14px' }}>이메일을 입력하면 무료 결과를 바로 확인할 수 있어요</p>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
              <div><label style={{ fontSize: '13px', color: '#CE93D8', display: 'block', marginBottom: '6px' }}>닉네임 (선택)</label><input value={nick} onChange={e => setNick(e.target.value)} placeholder='예: 별빛, 익명' style={inputStyle} /></div>
              <div>
                <label style={{ fontSize: '13px', color: '#CE93D8', display: 'block', marginBottom: '6px' }}>이메일 주소 <span style={{ color: '#EF5350' }}>필수</span></label>
                <input value={email} onChange={e => { setEmail(e.target.value); setEmailError(''); }} placeholder='example@email.com' type='email' style={Object.assign({}, inputStyle, { borderColor: emailError ? '#EF5350' : 'rgba(206,147,216,0.3)' })} />
                {emailError && <div style={{ color: '#EF5350', fontSize: '12px', marginTop: '6px' }}>{emailError}</div>}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(206,147,216,0.15)', borderRadius: '12px', padding: '16px' }}>
                <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '12px' }}><input type='checkbox' defaultChecked disabled style={{ marginTop: '2px' }} /><span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}><strong style={{ color: 'rgba(255,255,255,0.8)' }}>[필수] 개인정보 수집 이용 동의</strong><br />이메일을 수집하여 테스트 결과 발송 목적으로만 사용합니다.</span></label>
                <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}><input type='checkbox' checked={marketingConsent} onChange={e => setMarketingConsent(e.target.checked)} style={{ marginTop: '2px' }} /><span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}><strong style={{ color: 'rgba(255,255,255,0.8)' }}>[선택] 마케팅 정보 수신 동의</strong><br />신규 콘텐츠, 할인 정보를 이메일로 받겠습니다.</span></label>
              </div>
            </div>
            <button style={primaryBtn} onClick={handleSubmit}>무료 결과 확인하기 →</button>
          </div>
        )}

        {screen === SCREENS.LOADING && (
          <div style={{ textAlign: 'center' }}>
            <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
            <div style={{ width: '56px', height: '56px', border: '3px solid rgba(206,147,216,0.2)', borderTopColor: '#CE93D8', borderRadius: '50%', margin: '0 auto 20px', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ fontSize: '18px', marginBottom: '8px' }}>분석 중입니다...</h3>
            <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '14px' }}>7가지 패턴을 종합해 맞춤 결과를 만들고 있어요</p>
          </div>
        )}

        {screen === SCREENS.FREE_RESULT && scores && (() => {
          const ti = getType(scores.total);
          const radarData = scores.dimScores.map(d => ({ subject: d.name, score: d.score, fullMark: 20 }));
          const sc = getScoreCopy(scores.total);
          const sorted = [...scores.dimScores].sort((a, b) => b.score - a.score);
          return (
            <div>
              <div style={{ fontSize: '11px', letterSpacing: '3px', color: '#CE93D8', textTransform: 'uppercase', marginBottom: '16px', textAlign: 'center' }}>진단 완료 · 무료 결과</div>
              <div style={{ background: ti.bg, border: '2px solid ' + ti.border, borderRadius: '16px', padding: '20px', marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ fontSize: '34px', marginBottom: '6px' }}>{ti.emoji}</div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: ti.color, marginBottom: '4px' }}>{ti.type} — {ti.detail}</div>
                <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.55)', marginTop: '6px' }}>총점 {scores.total}점 / 140</div>
              </div>

              {/* 항목별 점수 */}
              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(206,147,216,0.2)', borderRadius: '16px', padding: '20px', marginBottom: '18px' }}>
                <div style={{ fontSize: '12px', color: '#CE93D8', letterSpacing: '2px', marginBottom: '18px' }}>7가지 패턴 점수 (높은 순)</div>
                {sorted.map(d => {
                  const lv = getLev(d.score);
                  return (
                    <div key={d.id} style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600 }}>{d.icon} {d.name}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.55)' }}>{d.score} / {d.max}</span>
                          <span style={{ background: lv.color, color: '#fff', borderRadius: '10px', padding: '2px 10px', fontSize: '11px', fontWeight: 700 }}>{lv.label}</span>
                        </div>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px' }}>
                        <div style={{ height: '100%', width: ((d.score / d.max) * 100) + '%', background: lv.color, borderRadius: '4px', transition: 'width 0.6s' }} />
                      </div>
                    </div>
                  );
                })}
                <button onClick={copyScores} style={{ marginTop: '8px', width: '100%', background: copied ? 'rgba(102,187,106,0.15)' : 'rgba(206,147,216,0.08)', border: '1px solid ' + (copied ? 'rgba(102,187,106,0.4)' : 'rgba(206,147,216,0.25)'), borderRadius: '10px', padding: '12px', color: copied ? '#A5D6A7' : 'rgba(255,255,255,0.65)', fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }}>
                  {copied ? '✅ 복사 완료! 카카오톡에 붙여넣기 하세요' : '📋 내 점수 텍스트로 복사하기'}
                </button>
              </div>

              {/* 레이더 차트 */}
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(206,147,216,0.15)', borderRadius: '16px', padding: '18px', marginBottom: '18px' }}>
                <div style={{ fontSize: '12px', color: '#CE93D8', letterSpacing: '2px', marginBottom: '14px' }}>7가지 패턴 분포</div>
                <ResponsiveContainer width='100%' height={220}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke='rgba(255,255,255,0.08)' />
                    <PolarAngleAxis dataKey='subject' tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10 }} />
                    <Radar dataKey='score' stroke='#CE93D8' fill='#CE93D8' fillOpacity={0.22} />
                    <Tooltip contentStyle={{ background: '#1A0535', border: '1px solid #CE93D8', borderRadius: '8px', color: '#fff', fontSize: '12px' }} formatter={v => [v + '점', '점수']} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {aiLetter && (
                <div style={{ background: 'linear-gradient(145deg,#0D0020,#2A0A40)', border: '1px solid rgba(206,147,216,0.25)', borderRadius: '14px', padding: '20px', marginBottom: '20px', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ fontSize: '11px', color: '#CE93D8', letterSpacing: '2px', marginBottom: '12px' }}>라온단미의 맞춤 편지</div>
                  <div style={{ fontSize: '14px', lineHeight: 1.9, color: 'rgba(255,255,255,0.85)', maxHeight: '80px', overflow: 'hidden', position: 'relative' }}>{aiLetter.slice(0, 60)}...<div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '60px', background: 'linear-gradient(transparent,#0D0020)' }} /></div>
                  <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>심층 분석에서 전문 확인 가능</div>
                </div>
              )}

              {!timer.expired && (
                <div style={{ background: 'linear-gradient(135deg,rgba(239,83,80,0.2),rgba(183,28,28,0.2))', border: '1.5px solid rgba(239,83,80,0.5)', borderRadius: '14px', padding: '16px 18px', marginBottom: '16px', textAlign: 'center' }}>
                  <div style={{ fontSize: '12px', color: '#EF5350', letterSpacing: '2px', marginBottom: '6px' }}>⏱ 테스트 완료 후 1시간 한정</div>
                  <div style={{ fontSize: '28px', fontWeight: 900, color: '#fff', marginBottom: '4px' }}>{timer.display}</div>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)' }}>이 시간 안에 구매 시 <strong style={{ color: '#FFA726' }}>99,000원 → 69,000원</strong></div>
                </div>
              )}

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(206,147,216,0.2)', borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ fontSize: '16px', fontWeight: 800, marginBottom: '10px', color: '#CE93D8' }}>{sc.hook}</div>
                <div style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.72)', lineHeight: 1.85, whiteSpace: 'pre-line' }}>{sc.body}</div>
              </div>

              <div style={{ background: 'linear-gradient(135deg,rgba(106,27,154,0.3),rgba(156,39,176,0.2))', border: '1.5px solid rgba(206,147,216,0.4)', borderRadius: '18px', padding: '24px', marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', color: '#CE93D8', letterSpacing: '2px', marginBottom: '12px' }}>💎 심층 분석 패키지</div>
                <div style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: '18px' }}>✅ 7가지 패턴 상세 해설 (원인 + 변화 방향)<br />✅ 라온단미 맞춤 편지 전문<br />✅ 나를 구하는 21일 전자책<br />✅ 1:1 맞춤 분석 레터 (48시간 내 발송)</div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                  <button onClick={() => setScreen(SCREENS.PAID_RESULT)} style={{ flex: 1, background: 'transparent', border: '1.5px solid rgba(206,147,216,0.5)', borderRadius: '12px', padding: '14px 10px', color: 'rgba(255,255,255,0.7)', cursor: 'pointer', fontSize: '13px', lineHeight: 1.5 }}>📊 상세 리포트만<br /><strong style={{ color: '#fff', fontSize: '15px' }}>9,900원</strong></button>
                  <button onClick={() => setScreen(SCREENS.PAID_RESULT)} style={{ flex: 1, background: 'linear-gradient(135deg,#6A1B9A,#9C27B0)', border: 'none', borderRadius: '12px', padding: '14px 10px', color: '#fff', cursor: 'pointer', fontSize: '13px', lineHeight: 1.5 }}>📖 전자책 풀패키지<br />{!timer.expired ? <span><s style={{ opacity: 0.6, fontSize: '12px' }}>99,000원</s> <strong style={{ fontSize: '15px', color: '#FFD54F' }}>69,000원</strong></span> : <strong style={{ fontSize: '15px' }}>99,000원</strong>}</button>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '10px', padding: '14px', textAlign: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>지금 이 페이지를 닫으면<br />오늘 본 내 패턴 분석 결과는 사라져요.<br /><strong style={{ color: '#CE93D8' }}>오늘 본 것, 오늘 확인하세요.</strong></div>
                </div>
                <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 1.6 }}>디지털 콘텐츠 특성상 구매 후 콘텐츠 열람 시 환불이 어려울 수 있습니다. 구매 전 무료 결과를 충분히 확인해주세요.</div>
              </div>
              <button style={ghostBtn} onClick={reset}>처음부터 다시하기</button>
            </div>
          );
        })()}

        {screen === SCREENS.PAID_RESULT && scores && (
          <div>
            <div style={{ fontSize: '11px', letterSpacing: '3px', color: '#CE93D8', textTransform: 'uppercase', marginBottom: '16px', textAlign: 'center' }}>심층 분석 · 상세 결과</div>
            <div style={{ background: 'linear-gradient(135deg,rgba(106,27,154,0.4),rgba(156,39,176,0.3))', border: '1.5px solid #9C27B0', borderRadius: '14px', padding: '20px', marginBottom: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 800, marginBottom: '8px' }}>🔒 심층 분석 잠금 해제</div>
              <div style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, marginBottom: '16px' }}>결제 후 아래 상세 분석 전체가 공개됩니다.<br />결제 확인 즉시 이메일로도 발송해드려요.</div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button style={{ flex: 1, background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.2)', borderRadius: '12px', padding: '14px', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>📊 리포트만<br /><strong>9,900원</strong></button>
                <button style={{ flex: 1.3, background: 'linear-gradient(135deg,#6A1B9A,#9C27B0)', border: 'none', borderRadius: '12px', padding: '14px', color: '#fff', cursor: 'pointer', fontSize: '14px' }}>📖 전자책 풀패키지<br /><strong>99,000원</strong></button>
              </div>
              <div style={{ marginTop: '12px', fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>카카오페이 · 네이버페이 · 카드 결제 가능</div>
            </div>
            <button style={ghostBtn} onClick={() => setScreen(SCREENS.FREE_RESULT)}>← 무료 결과로 돌아가기</button>
          </div>
        )}

      </div>
    </div>
  );
}

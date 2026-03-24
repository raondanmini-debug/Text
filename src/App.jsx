import { useState, useEffect } from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';

const SHEET_URL = 'https://script.google.com/macros/s/AKfycbyNPOJmdcGDCXhPCgrRsQ3Zu8WJaS-E266W0-R3t9M90-39vx21XrRVlfMDd-YtYl2d/exec';
const SITE_URL = 'https://text-68n.pages.dev';

const BIZ = {
  name: '라온단미',
  rep: '최국화',
  regNo: '177-32-01407',
  saleNo: '2025-별내-0002',
  addr: '경기도 남양주시 두물로 11번길 40-19, 6층 (별내동, 풍전프라자)',
  email: 'raondanmini@gmail.com',
};

const SC = {
  INTRO: 'intro', CAREGIVER: 'caregiver', P0: 'p0', P1: 'p1',
  EMAIL: 'email', LOADING: 'loading', RESULT: 'result',
  BASIC: 'basic', FULL: 'full', PAY: 'pay',
  PRIVACY: 'privacy', REFUND: 'refund', TERMS: 'terms',
};

const CAREGIVER_OPTS = [
  { id: 'both', label: '부모님 두 분 모두' }, { id: 'mother', label: '어머니 (단독)' },
  { id: 'father', label: '아버지 (단독)' }, { id: 'grandparents', label: '조부모' },
  { id: 'relatives', label: '다른 친척' }, { id: 'facility', label: '시설 · 위탁가정' },
  { id: 'independent', label: '사실상 보호자 없이 지냄' },
];

const P0Q = [
  '주 양육자와 함께할 때, 나는 있는 그대로의 나를 드러낼 수 있었다',
  '가정 내 감정 표현은 전반적으로 허용되는 분위기였다',
  '주 양육자(들)는 나의 감정이나 생각에 충분히 반응해 주었다',
  '가정 안의 분위기는 대체로 예측 가능하고 안정적이었다',
  '어릴 때 나에게는 스스로 결정하고 선택할 수 있는 공간이 있었다',
  '실수하거나 기대에 못 미쳤을 때, 수용보다는 비판이나 실망을 경험했다',
  '가정 내에서 어른들의 감정이나 문제를 내가 해결해야 한다는 압박이 있었다',
];

const DIMS = [
  { id: 'd1', name: '방어기제', color: '#CE93D8', qs: ['힘든 일이 생기면 감정보다 원인 분석에 먼저 집중하고, 감정은 나중에 처리하는 편이다', '상처받은 것을 당시에는 몰랐다가, 한참 후에야 그때 많이 힘들었구나 라고 깨닫는 경우가 있다', '감당하기 어려운 상황이 오면 관련된 것을 일단 멀리하거나 다른 것에 집중하는 방식으로 대처한다', '속으로는 불안하거나 힘들어도, 주변에는 괜찮은 것처럼 보이게 행동하는 것이 익숙하다', '극도로 스트레스받는 상황에서 그 상황이 현실처럼 느껴지지 않거나 나를 외부에서 바라보는 것 같은 느낌이 든 적이 있다', '매우 힘든 시기를 겪었는데도 당시에는 별로 힘들지 않았고, 한참 뒤에야 그 무게를 느낀 경험이 있다'] },
  { id: 'd2', name: '애착유형', color: '#F48FB1', qs: ['가까운 관계에서 상대방의 반응이 없거나 늦으면, 나에게 문제가 생긴 건 아닌지 불안해진다', '관계가 깊어질수록 상대방이 진짜 나를 알게 될까봐 두렵거나 불편한 느낌이 든다', '나를 아끼고 잘 대해주는 사람에게 오히려 어색함이나 불신이 생기는 경우가 있다', '관계에서 갈등이 생기면 그 관계 자체가 끝나버릴 것 같은 강한 불안감을 느낀다', '친밀한 관계가 형성되기 직전, 이유를 설명하기 어려운 거리감이나 회피 충동을 경험한 적이 있다', '정서적으로 나를 필요로 하는 사람에게는 잘 반응하지만, 정작 내가 필요할 때 도움을 요청하는 것은 어렵다'] },
  { id: 'd3', name: '인지왜곡', color: '#80DEEA', qs: ['한 번 실패하거나 거절당하면 나는 원래 이런 사람이야 라는 결론으로 이어지는 경향이 있다', '칭찬이나 긍정적 피드백을 받아도 우연이다 저 사람이 모르는 것이다 라고 생각하며 무효화하는 편이다', '어떤 일이 잘못될 가능성이 있으면 최악의 시나리오가 자동으로 먼저 떠오른다', '상대방의 표정이나 행동을 보고 분명히 나를 좋아하지 않을 것이다 라고 확신하는 경향이 있다', '일을 할 때 완벽하지 않으면 아예 하지 않은 것과 같다는 생각이 든다', '좋았던 일보다 잘못된 일이 더 오래 더 강하게 기억에 남는다'] },
  { id: 'd4', name: '회복탄력성', color: '#A5D6A7', positive: true, qs: ['예상치 못한 어려움이 생겼을 때, 어느 정도 시간이 지나면 다시 일상으로 돌아올 수 있다', '실패나 좌절 이후에도 다음엔 어떻게 할까 를 생각하는 쪽으로 전환되는 편이다', '감정이 격해지는 상황에서도 결정적인 행동 전에 잠깐 멈출 수 있다', '힘든 시기가 있어도 영원히 이럴 것이다 보다 이것도 지나간다 는 관점이 드는 편이다', '내가 통제할 수 없는 일과 할 수 있는 일을 어느 정도 구분하는 편이다'] },
  { id: 'd5', name: '신체신호', color: '#FFAB91', qs: ['특정 사람과의 연락이나 대화 전후에 두통, 피로감, 소화 불편 같은 신체 반응이 나타나는 경우가 있다', '스트레스를 받는 상황에서 가슴이 답답하거나, 목이 조이는 느낌, 얕은 호흡 같은 신체 반응이 먼저 오는 편이다', '누군가 나에게 불만이 있을 것 같다는 생각이 들면 마음속에서 쉽게 털어내기가 어렵다', '비판이나 지적을 받으면 그 내용과 무관하게 감정적 반응이 즉각적으로 강하게 온다', '관계에서 상처받은 감정이 오래 남아, 원할 때 놓아버리기가 어렵다'] },
  { id: 'd6', name: '과도한통제', color: '#FFD54F', qs: ['내가 직접 하면 더 잘 될 것 같아서 다른 사람에게 맡기는 것이 불편하다', '모든 것을 파악하고 있어야 안심이 되며, 예측 불가능한 변수가 생기면 즉각적으로 불안이 올라온다', '쉬고 있을 때 지금 뭔가 하고 있어야 한다 는 생각이 들거나 아무것도 안 하는 것에 죄책감을 느낀다', '내가 나서지 않으면 일이 잘못될 것 같아서, 사실 내가 안 해도 되는 일까지 맡게 되는 경우가 많다', '완벽하게 준비되지 않았다는 이유로 시작을 미루는 패턴이 반복된다', '타인에게 도움을 받거나 의지하는 것이 불편하게 느껴진다'] },
  { id: 'd7', name: '자책죄책감', color: '#EF9A9A', qs: ['실수를 했을 때 내가 뭔가 잘못한 것이 아니라 내가 나쁜 사람이다 는 느낌이 든다', '타인에게 약한 모습이나 어려움을 드러내는 것이 매우 불편하거나 두렵다', '비판을 받을 때 행동에 대한 피드백으로 받아들이기보다 나 자신이 거부당하는 느낌을 받는다', '가족 중 누군가가 힘들어 보이면 내가 더 잘했어야 했다는 생각이 자동으로 올라온다', '내 필요나 욕구를 채우는 것이 이기적인 것 같아 망설여질 때가 있다', '가족의 기대에 부응하지 못했다고 느낄 때, 심한 자책이나 무력감이 동반된다'] },
  { id: 'd8', name: '감정인식', color: '#B3E5FC', positive: true, qs: ['내 감정이 어떤 것인지 명확하게 말로 표현하기 어려울 때가 많다', '기분이 안 좋다는 것은 알지만 그것이 슬픔인지, 분노인지, 불안인지 구분이 잘 안 된다', '감정적으로 힘든 상황에서 감정보다 신체 증상이 먼저 나타나는 편이다', '대화에서 상대방의 감정 상태를 감지하는 것보다 내 감정 상태를 파악하는 것이 더 어렵다', '어떤 감정인지 알기 전에 이미 특정 행동을 하고 나서, 나중에 왜 그렇게 했지 를 생각하는 경우가 있다'] },
  { id: 'd9', name: '자기자비', color: '#F8BBD0', positive: true, qs: ['실수했을 때 다른 사람에게는 괜찮다고 할 상황인데 나 자신에게는 유독 가혹하게 대한다', '힘든 순간에 나 자신에게 따뜻하게 대하는 것이 어색하거나 불필요하게 느껴진다', '내가 겪는 어려움이 많은 사람들이 경험하는 보편적인 것이라기보다 특별히 나에게만 일어나는 일처럼 느껴진다', '괴로운 생각이나 감정이 떠오를 때, 그것을 객관적으로 바라보기보다 그 감정에 완전히 압도되는 경향이 있다', '나 자신을 돌보는 것에 시간을 쓰면 왠지 허용되지 않는 것 같은 느낌이 든다'] },
  { id: 'd10', name: '심리적유연성', color: '#DCEDC8', positive: true, qs: ['불편한 생각이나 감정이 생기면 그것에서 빨리 벗어나거나 없애려고 노력하는 편이다', '내 생각이나 믿음이 사실이 아닐 수도 있다는 것을 받아들이는 것이 어렵다', '지금 이 순간에 집중하기보다 과거에 대한 반추나 미래에 대한 걱정이 더 많이 나타난다', '내가 중요하게 생각하는 것과 실제로 하는 행동 사이에 괴리감을 자주 느낀다', '상황이 달라져도 내 방식을 바꾸기가 어렵거나, 새로운 접근을 시도하는 것이 불편하다'] },
];

const OPTS = [{ l: '전혀 아니다', v: 1 }, { l: '아니다', v: 2 }, { l: '가끔 그렇다', v: 3 }, { l: '종종 그렇다', v: 4 }, { l: '항상 그렇다', v: 5 }];
const P0_OPTS = [{ l: '전혀 아니다', v: 1 }, { l: '아니다', v: 2 }, { l: '보통이다', v: 3 }, { l: '그렇다', v: 4 }, { l: '매우 그렇다', v: 5 }];

const CHECKLIST = [
  '화가 나도 나중에 혼자 삭히는 편이다',
  '가족이 힘들어 보이면 왠지 내 탓인 것 같다',
  '잘 대해주는 사람보다 나를 힘들게 하는 사람에게 더 오래 마음이 간다',
  '충분히 잘하는데도 늘 부족한 느낌이 든다',
  '실수했을 때 행동이 아닌 내 자체가 나쁜 것 같은 느낌이 든다',
  '다 내가 해야 안심이 된다. 맡기면 불안하다',
  '가까워질수록 불편하거나, 반대로 떠날까봐 불안하다',
  '열심히 살고 있는데 왜 이렇게 공허한지 모르겠다',
  '분명히 피곤한데 멈추면 안 될 것 같다',
  '나를 위한 선택을 하면 뭔가 허용되지 않는 느낌이 든다',
  '내가 느끼는 감정이 정확히 뭔지 말하기 어려울 때가 있다',
  '잘 되고 있는 것보다 잘못된 것이 더 오래 머릿속에 남는다',
];

const MID_MSGS = {
  10: { title: '잘 하고 있어요', body: '지금 솔직하게 답하는 것 자체가 이미 시작이에요. 이 응답들이 쌓여 당신만의 패턴 지도가 만들어지고 있어요.' },
  21: { title: '절반을 넘었어요', body: '이 패턴들이 관계에서 어떻게 나타나는지 — 곧 언어로 보게 될 거예요.' },
  35: { title: '거의 다 왔어요', body: '지금 이 질문들에 솔직하게 답하는 것 자체가 이미 변화의 시작이에요.' },
  50: { title: '마지막 구간이에요', body: '12분의 솔직함이 수년간의 패턴을 처음으로 언어로 만들어줄 거예요.' },
};

const BASIC_FAQ = [
  { q: '결제 후 언제 받을 수 있나요?', a: '결제 완료 즉시 입력하신 이메일로 발송됩니다. 5분 내 미수신 시 스팸함을 확인하거나 raondanmini@gmail.com으로 문의해 주세요.' },
  { q: '어떤 형태로 받나요?', a: 'PDF 파일로 이메일 발송됩니다. 스마트폰, 태블릿, PC 모두에서 열람 가능하며, 저장해서 반복 열람할 수 있어요.' },
  { q: '전문 심리상담인가요?', a: '아니에요. 전문 심리상담 및 의료 행위를 대체하지 않는 자기계발 콘텐츠입니다. 심각한 어려움이 있다면 전문가 도움을 받으시길 권장합니다.' },
  { q: '환불은 가능한가요?', a: '디지털 콘텐츠 특성상 발송 후 환불이 어렵습니다. 발송 오류 등 당사 귀책 사유는 전액 환불합니다.' },
];
const FULL_FAQ = [
  { q: '사연은 어떻게 보내나요?', a: '결제 완료 이메일에 사연 접수 링크가 포함됩니다. 지금 가장 힘든 것, 반복되는 상황, 달라지고 싶은 것을 자유롭게 적어 제출해 주세요.' },
  { q: '라온단미가 직접 읽는 건가요?', a: '네, 라온단미가 직접 테스트 결과와 사연을 읽고 씁니다. AI 자동 생성이 아닌 실제 사람의 시간과 진심이 담긴 편지예요.' },
  { q: '편지는 언제 받을 수 있나요?', a: '사연 접수 후 48시간 이내 이메일 발송됩니다. 직접 읽고 쓰는 만큼 주간 접수 건수가 제한될 수 있어요.' },
  { q: '이 서비스는 전문 심리상담인가요?', a: '아니에요. 같은 길을 먼저 걸어온 사람이 쓰는 자기계발 목적 콘텐츠입니다. 심각한 어려움이 있다면 반드시 전문 상담사 도움을 받으세요.' },
  { q: '환불은 가능한가요?', a: '편지 작성 시작 후 환불이 어렵습니다. 발송 오류 등 당사 귀책 사유는 전액 환불합니다.' },
];

function getTrigger(scores) {
  const top = [...scores.dimScores].sort((a, b) => b.score - a.score)[0];
  const m = {
    d6: '열심히 하는데 항상 뭔가 부족하고, 쉬어도 쉰 것 같지 않은 이유가 있어요. 모든 것을 스스로 통제해야 안심이 되는 구조 — 이것은 의지가 아니라 오래전에 학습된 생존 방식이에요. 이 패턴이 지금 어떤 방식으로 에너지를 소진시키고, 관계와 일에서 어떻게 반복되는지 분석에서 전체 구조를 보여드릴게요.',
    d1: '겉으로는 잘 기능하고 있어요. 하지만 특정 순간마다 이유 모를 공허함이 오거나, 충분히 힘들었을 텐데 당시에는 별로 힘들지 않았다는 느낌이 든 적 있다면 — 이 패턴이 작동하고 있는 거예요. 감정을 논리로 덮는 방식이 얼마나 에너지를 소비하는지, 그리고 어떻게 다른 방식으로 전환할 수 있는지 분석에서 보여드릴게요.',
    d2: '관계에서 비슷한 패턴이 반복된다면, 상대의 문제가 아닐 가능성이 높아요. 잘 대해주는 사람에게 어색함이 생기거나, 가까워질수록 특정한 불안이 작동하는 것 — 이것은 성격이 아니라 어릴 때 형성된 연결 방식이에요. 이 패턴이 어디서 왔는지, 지금 어떻게 반복되는지를 이해하기 전까지 관계는 같은 구조 안에서 돌아갑니다.',
    d3: '같은 상황에서 다른 사람보다 더 많이 상처받거나, 칭찬이 잘 안 들리거나, 최악의 시나리오가 자동으로 떠오른다면 — 이것은 예민함이 아니에요. 뇌가 특정 방식으로 정보를 처리하도록 학습된 결과예요. 이 자동화된 회로가 어떻게 형성됐는지, 그리고 어떻게 재조정할 수 있는지 분석에서 다룰게요.',
    d7: '스스로에게만큼은 유독 가혹한 기준이 적용되는 이유 — 그리고 그것이 왜 논리로 반박해도 바뀌지 않는지, 이 구조를 이해하는 것이 변화의 시작이에요. 자책이 반복될 때마다 자아 이미지가 어떻게 강화되는지, 그 회로를 끊어낼 수 있는 방법을 분석에서 구체적으로 보여드릴게요.',
    d5: '스트레스가 머리보다 몸으로 먼저 오는 것은 신체 문제가 아니에요. 심리적 신호가 충분히 처리되지 못하고 몸으로 우회되는 구조예요. 어떤 상황에서, 어떤 사람과의 관계에서 이 신호가 활성화되는지 — 패턴을 파악하면 대응 방법이 달라져요.',
    d8: '감정을 모르는 것이 아니에요. 감정을 언어화하는 경로가 아직 충분히 열려 있지 않은 것이에요. 이것이 관계에서의 단절감, 자기 자신과의 거리감으로 나타나요. 감정을 더 정확하게 인식하고 표현하는 방법이 분석에 있어요.',
    d9: '나 자신에게 친구에게 하듯 대하는 것이 왜 이렇게 어색한가. 자기자비의 부재가 회복 속도를 낮추고, 같은 실수 앞에서 더 오래 무너지게 만드는 구조예요. 이 패턴의 기원과 변화 방법을 분석에서 보여드릴게요.',
    d10: '머리로는 바꿔야 한다는 걸 아는데 행동이 안 따라오는 이유 — 불편함을 없애려는 시도가 오히려 불편함을 유지시키는 역설이 여기 있어요. 심리적 유연성을 높이는 구체적인 방법이 분석에 있어요.',
    d4: '어려움에서 돌아오는 힘은 분명히 있어요. 그런데 그 힘이 제대로 작동하지 못하게 막는 다른 패턴이 함께 있습니다. 어떤 조합이 회복탄력성을 가로막는지, 그 구조를 이해하면 에너지 관리가 달라져요.',
  };
  return m[top.id] || '이 패턴 구조가 어떻게 삶의 질을 제한하고 있는지, 그리고 어디서 끊어낼 수 있는지 심층 분석이 보여드립니다.';
}

function getType(t) {
  const max = DIMS.reduce((s, d) => s + d.qs.length * 5, 0), r = t / max;
  if (r <= 0.45) return { type: '초록불', color: '#66BB6A', bg: 'rgba(46,125,50,0.12)', border: '#388E3C', symbol: '●', detail: '경제 독립 집중형' };
  if (r <= 0.65) return { type: '노란불', color: '#FFA726', bg: 'rgba(230,81,0,0.12)', border: '#E65100', symbol: '◐', detail: '경계선 회복형' };
  return { type: '빨간불', color: '#EF5350', bg: 'rgba(183,28,28,0.12)', border: '#B71C1C', symbol: '▲', detail: '자아 재건형' };
}
function getLev(s, max, pos) {
  const r = s / max;
  if (pos) { if (r >= 0.75) return { label: '높음', color: '#66BB6A' }; if (r >= 0.5) return { label: '보통', color: '#FFA726' }; return { label: '낮음', color: '#EF5350' }; }
  if (r <= 0.3) return { label: '낮음', color: '#66BB6A' }; if (r <= 0.55) return { label: '보통', color: '#FFA726' }; if (r <= 0.75) return { label: '높음', color: '#FF7043' }; return { label: '매우 높음', color: '#EF5350' };
}
function calcScores(ans) {
  const ds = DIMS.map(d => { const score = d.qs.reduce((s, _, i) => s + (ans[d.id + '_' + i] || 0), 0); return { ...d, score, max: d.qs.length * 5 }; });
  return { dimScores: ds, total: ds.reduce((s, d) => s + d.score, 0) };
}
function useTimer(start) {
  const [rem, setRem] = useState(3600);
  useEffect(() => { if (!start) return; const iv = setInterval(() => setRem(Math.max(0, 3600 - Math.floor((Date.now() - start) / 1000))), 1000); return () => clearInterval(iv); }, [start]);
  return { display: String(Math.floor(rem / 60)).padStart(2, '0') + ':' + String(rem % 60).padStart(2, '0'), expired: rem === 0, active: rem > 0 && !!start };
}
async function sheet(p) { try { await fetch(SHEET_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) }); } catch { } }
function shareResult(typeText) {
  const text = '나 심리 독립 테스트 했더니\n' + typeText + ' 나왔어\n너도 해봐';
  if (navigator.share) { navigator.share({ title: '라온단미 심리 독립 테스트', text, url: SITE_URL }).catch(() => { }); }
  else { navigator.clipboard?.writeText(SITE_URL).then(() => alert('링크가 복사됐어요! 카카오톡에 붙여넣기 해보세요.')).catch(() => alert('링크: ' + SITE_URL)); }
}

// 스타일 상수
const bg = 'linear-gradient(155deg,#0D0020 0%,#1A0535 40%,#2D1060 100%)';
const ff = '\'Apple SD Gothic Neo\',\'Noto Sans KR\',sans-serif';
const PG = { minHeight: '100vh', background: bg, fontFamily: ff, color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 16px 56px' };
const WR = { width: '100%', maxWidth: '560px', paddingTop: '16px' };
const BTN = { width: '100%', background: 'linear-gradient(135deg,#6A1B9A,#9C27B0)', border: 'none', borderRadius: '14px', padding: '18px', fontSize: '15.5px', fontWeight: 700, color: '#fff', cursor: 'pointer' };
const BTN2 = { ...BTN, background: 'linear-gradient(135deg,#4A148C,#7B1FA2)' };
const GHOST = { width: '100%', background: 'transparent', border: '1px solid rgba(255,255,255,0.14)', borderRadius: '12px', padding: '13px', color: 'rgba(255,255,255,0.48)', fontSize: '13px', cursor: 'pointer', marginTop: '9px' };
const INP = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(206,147,216,0.3)', borderRadius: '10px', padding: '13px 16px', color: '#fff', fontSize: '15px', outline: 'none', boxSizing: 'border-box' };
const LBL = { fontSize: '10px', letterSpacing: '4px', color: 'rgba(255,255,255,0.28)', textTransform: 'uppercase' };
const BACK = { background: 'none', border: 'none', color: 'rgba(255,255,255,0.38)', cursor: 'pointer', fontSize: '18px', padding: '0' };
const CD = (a) => ({ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(206,147,216,0.18)', borderRadius: '18px', padding: '26px', marginBottom: '18px', opacity: a ? 0 : 1, transform: a ? 'translateY(8px)' : 'none', transition: 'all 0.28s' });

function Prog({ pct, color }) { return (<div style={{ height: '3px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px' }}><div style={{ height: '100%', width: pct + '%', background: color || '#CE93D8', borderRadius: '2px', transition: 'width 0.35s' }} /></div>); }
function OBtn({ active, color, onClick, children }) { const c = color || '#CE93D8'; return (<button onClick={onClick} style={{ background: active ? 'rgba(206,147,216,0.13)' : 'rgba(255,255,255,0.04)', border: '1.5px solid ' + (active ? c : 'rgba(255,255,255,0.09)'), borderRadius: '12px', padding: '13px 16px', color: active ? '#fff' : 'rgba(255,255,255,0.7)', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px', width: '100%', transition: 'all 0.14s', textAlign: 'left' }}><div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1.5px solid ' + (active ? c : 'rgba(255,255,255,0.22)'), background: active ? c : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>{active ? '✓' : ''}</div>{children}</button>); }
function CkBtn({ active, onClick, children }) { return (<div onClick={onClick} style={{ display: 'flex', alignItems: 'flex-start', gap: '11px', background: active ? 'rgba(206,147,216,0.09)' : 'rgba(255,255,255,0.03)', border: '1px solid ' + (active ? 'rgba(206,147,216,0.36)' : 'rgba(255,255,255,0.06)'), borderRadius: '11px', padding: '12px 14px', cursor: 'pointer', transition: 'all 0.14s' }}><div style={{ width: '17px', height: '17px', borderRadius: '4px', border: '1.5px solid ' + (active ? '#CE93D8' : 'rgba(255,255,255,0.2)'), background: active ? '#CE93D8' : 'transparent', flexShrink: 0, marginTop: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>{active ? '✓' : ''}</div><span style={{ fontSize: '13.5px', color: active ? '#fff' : 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{children}</span></div>); }
function ImgSlot({ label, h }) { return (<div style={{ height: h || 100, background: 'rgba(255,255,255,0.025)', border: '1.5px dashed rgba(206,147,216,0.16)', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '5px', marginBottom: '14px' }}><div style={{ fontSize: '15px', opacity: 0.18 }}>◻</div><div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.18)', letterSpacing: '2px', textTransform: 'uppercase', textAlign: 'center', padding: '0 10px' }}>{label}</div></div>); }
function FAQ({ items }) { const [o, setO] = useState(null); return (<div>{items.map((it, i) => (<div key={i} style={{ marginBottom: '5px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}><button onClick={() => setO(o === i ? null : i)} style={{ width: '100%', background: 'none', border: 'none', padding: '12px 14px', color: 'rgba(255,255,255,0.7)', fontSize: '13px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left', gap: '8px' }}><span style={{ flex: 1 }}>{it.q}</span><span style={{ fontSize: '14px', color: 'rgba(255,255,255,0.25)', flexShrink: 0 }}>{o === i ? '−' : '+'}</span></button>{o === i && <div style={{ padding: '0 14px 12px', fontSize: '12.5px', color: 'rgba(255,255,255,0.48)', lineHeight: 1.75 }}>{it.a}</div>}</div>))}</div>); }
function RevHolder() { return (<div style={{ background: 'rgba(255,255,255,0.025)', border: '1.5px dashed rgba(206,147,216,0.16)', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}><div style={{ fontSize: '9px', color: 'rgba(206,147,216,0.38)', letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '9px' }}>이용 후기</div>{[1, 2, 3].map(i => (<div key={i} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '8px', padding: '10px 12px', marginBottom: '5px' }}><div style={{ height: '7px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '5px', width: '55%' }} /><div style={{ height: '7px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', width: '80%' }} /></div>))}<div style={{ textAlign: 'center', fontSize: '9px', color: 'rgba(255,255,255,0.16)', marginTop: '7px' }}>첫 번째 후기가 곧 채워집니다</div></div>); }

// 사업자 정보 푸터
function BizFtr({ go }) {
  return (
    <div style={{ marginTop: '22px', padding: '13px', background: 'rgba(0,0,0,0.18)', borderRadius: '9px', fontSize: '9.5px', color: 'rgba(255,255,255,0.22)', lineHeight: 2.0 }}>
      <div>상호: {BIZ.name}</div>
      <div>대표자: {BIZ.rep}</div>
      <div>사업자등록번호: {BIZ.regNo}</div>
      <div>통신판매업 신고번호: {BIZ.saleNo}</div>
      <div>이메일: {BIZ.email}</div>
      <div style={{ fontSize: '8.5px', marginTop: '3px', paddingTop: '4px', borderTop: '1px solid rgba(255,255,255,0.06)', lineHeight: 1.6 }}>{BIZ.addr}</div>
      <div style={{ display: 'flex', gap: '11px', flexWrap: 'wrap', marginTop: '8px' }}>
        <button onClick={() => go(SC.PRIVACY)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.32)', fontSize: '9.5px', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>개인정보처리방침</button>
        <button onClick={() => go(SC.REFUND)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.32)', fontSize: '9.5px', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>환불정책</button>
        <button onClick={() => go(SC.TERMS)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.32)', fontSize: '9.5px', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>이용약관</button>
      </div>
      <div style={{ marginTop: '6px', fontSize: '8.5px', color: 'rgba(255,255,255,0.15)' }}>© 2026 {BIZ.name}. 본 서비스는 전문 심리상담 및 의료 행위를 대체하지 않는 자기계발 목적 콘텐츠입니다.</div>
    </div>
  );
}

function Legal({ title, onBack, children }) { return (<div><button onClick={onBack} style={{ ...BACK, marginBottom: '14px', fontSize: '13px', color: 'rgba(255,255,255,0.35)', display: 'flex', alignItems: 'center', gap: '5px' }}>← 돌아가기</button><div style={{ ...LBL, color: '#CE93D8', marginBottom: '7px' }}>{title}</div><div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(206,147,216,0.14)', borderRadius: '13px', padding: '18px', fontSize: '12px', color: 'rgba(255,255,255,0.55)', lineHeight: 1.85 }}>{children}</div><div style={{ marginTop: '10px', fontSize: '10px', color: 'rgba(255,255,255,0.18)', textAlign: 'center' }}>{BIZ.name} · {BIZ.regNo} · {BIZ.email}</div></div>); }

function MidMsg({ msg, onClose }) { return (<div style={{ position: 'fixed', inset: 0, background: 'rgba(13,0,32,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '24px' }} onClick={onClose}><div style={{ background: 'linear-gradient(145deg,#1A0535,#2D1060)', border: '1px solid rgba(206,147,216,0.3)', borderRadius: '18px', padding: '28px 24px', maxWidth: '360px', textAlign: 'center' }} onClick={e => e.stopPropagation()}><div style={{ fontSize: '26px', color: '#CE93D8', fontWeight: 300, marginBottom: '9px' }}>✦</div><div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '7px' }}>{msg.title}</div><p style={{ fontSize: '13.5px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.85, marginBottom: '17px' }}>{msg.body}</p><button onClick={onClose} style={{ background: 'rgba(206,147,216,0.15)', border: '1px solid rgba(206,147,216,0.3)', borderRadius: '10px', padding: '11px 24px', color: '#fff', fontSize: '14px', cursor: 'pointer', fontWeight: 600 }}>계속하기 →</button></div></div>); }

// ─── 메인 ───
export default function App() {
  const [sc, setSc] = useState(SC.INTRO);
  const [prev, setPrev] = useState(SC.RESULT);
  const [care, setCare] = useState([]);
  const [p0, setP0] = useState({});
  const [p0i, setP0i] = useState(0);
  const [dimi, setDimi] = useState(0);
  const [qi, setQi] = useState(0);
  const [ans, setAns] = useState({});
  const [email, setEmail] = useState('');
  const [nick, setNick] = useState('');
  const [mkt, setMkt] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [err, setErr] = useState('');
  const [anim, setAnim] = useState(false);
  const [sel, setSel] = useState(null);
  const [scores, setScores] = useState(null);
  const [insight, setInsight] = useState('');
  const [letter, setLetter] = useState('');
  const [rStart, setRStart] = useState(null);
  const [ckd, setCkd] = useState([]);
  const [midMsg, setMidMsg] = useState(null);
  const timer = useTimer(rStart);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [sc]);

  const totalQs = DIMS.reduce((a, d) => a + d.qs.length, 0);
  const doneN = Object.keys(ans).length;
  const doneSF = DIMS.slice(0, dimi).reduce((a, d) => a + d.qs.length, 0) + qi;
  const maxTotal = DIMS.reduce((a, d) => a + d.qs.length * 5, 0);

  function goLegal(s) { setPrev(sc); setSc(s); }
  function backLegal() { setSc(prev); }
  function animate(fn) { setAnim(true); setTimeout(() => { fn(); setAnim(false); setSel(null); }, 255); }

  function reset() { setSc(SC.INTRO); setAns({}); setP0({}); setP0i(0); setDimi(0); setQi(0); setEmail(''); setNick(''); setInsight(''); setLetter(''); setScores(null); setRStart(null); setCkd([]); setCare([]); setAgreed(false); setMidMsg(null); }

  function goBack() {
    if (sc === SC.P0) { if (p0i > 0) { setP0i(p0i - 1); setSel(null); } else setSc(SC.CAREGIVER); }
    else if (sc === SC.P1) {
      if (qi > 0) { setQi(qi - 1); setSel(null); }
      else if (dimi > 0) { setDimi(dimi - 1); setQi(DIMS[dimi - 1].qs.length - 1); setSel(null); }
      else { setSc(SC.P0); setP0i(P0Q.length - 1); }
    }
    else if (sc === SC.EMAIL) { setSc(SC.P1); setDimi(DIMS.length - 1); setQi(DIMS[DIMS.length - 1].qs.length - 1); }
    else if (sc === SC.CAREGIVER) setSc(SC.INTRO);
  }

  function pick0(v) { setSel(v); setTimeout(() => { setP0(p => ({ ...p, ['p0_' + p0i]: v })); animate(() => { if (p0i < P0Q.length - 1) setP0i(p0i + 1); else setSc(SC.P1); }); }, 140); }

  function pick1(v) {
    setSel(v);
    const k = DIMS[dimi].id + '_' + qi;
    setTimeout(() => {
      const nA = { ...ans, [k]: v };
      setAns(nA);
      const nD = Object.keys(nA).length;
      if (MID_MSGS[nD]) { setMidMsg(MID_MSGS[nD]); return; }
      animate(() => { if (qi < DIMS[dimi].qs.length - 1) setQi(qi + 1); else if (dimi < DIMS.length - 1) { setDimi(dimi + 1); setQi(0); } else setSc(SC.EMAIL); });
    }, 140);
  }

  function afterMid() { setMidMsg(null); animate(() => { if (qi < DIMS[dimi].qs.length - 1) setQi(qi + 1); else if (dimi < DIMS.length - 1) { setDimi(dimi + 1); setQi(0); } else setSc(SC.EMAIL); }); }

  async function submit() {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setErr('올바른 이메일 주소를 입력해주세요'); return; }
    if (!agreed) { setErr('개인정보 수집 이용에 동의해주세요'); return; }
    setErr('');
    const s = calcScores(ans); setScores(s); setSc(SC.LOADING);
    const ti = getType(s.total);
    const top2 = [...s.dimScores].sort((a, b) => b.score - a.score).slice(0, 2);
    const pl = { nick: nick || '익명', email, marketing: mkt ? '동의' : '미동의', total: s.total, maxTotal, type: ti.type + ' ' + ti.detail, caregivers: care.join(',') };
    P0Q.forEach((_, i) => { pl['p0_' + i] = p0['p0_' + i] || 0; });
    DIMS.forEach(d => { d.qs.forEach((_, i) => { pl[d.id + '_' + i] = ans[d.id + '_' + i] || 0; }); });
    sheet(pl);
    const ip1 = `당신은 라온단미입니다. 심리 분석 전문 콘텐츠 라이터.

아래 패턴 데이터를 바탕으로 이 사람이 "아, 이게 나 얘기다. 정확하다."라고 느낄 수 있는 심층 인사이트를 작성해주세요.

[절대 금지]

- 테스트 문항이나 선택값 절대 언급 금지
- "당신은 X를 선택했으니" 같은 표현 금지
- 점수 수치 직접 언급 금지

[데이터]
유형: ${ti.type} ${ti.detail}
상위 패턴: ${top2.map(d => d.name).join(', ')}

[작성 조건]

- 250~350자 분량 (한국어 기준)
- 이 패턴 조합이 삶에서 만드는 구체적인 장면 2~3가지 묘사
- "왜 이런 일이 반복되는가"에 대한 심리적 원인 한 문장
- 이 사람이 아직 인식하지 못했을 역설적 진실 하나 포함
- 분석 문체. 따뜻하되 정확하게.`;

    const ip2 = `라온단미입니다. 닉네임: ${nick || '당신'}. 유형: ${ti.type} ${ti.detail}. 핵심 패턴: ${top2[0].name}. 조건: 80~120자, 테스트 내용 언급 금지, 따뜻하고 구체적, 마지막 줄 오늘 당장 해볼 것 하나.`;
    try {
      const [r1, r2] = await Promise.all([
        fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 500, messages: [{ role: 'user', content: ip1 }] }) }),
        fetch('https://api.anthropic.com/v1/messages', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 200, messages: [{ role: 'user', content: ip2 }] }) }),
      ]);
      const [d1, d2] = await Promise.all([r1.json(), r2.json()]);
      setInsight(d1.content?.[0]?.text || '');
      setLetter(d2.content?.[0]?.text || '');
    } catch { setInsight(''); setLetter(''); }
    setRStart(Date.now()); setSc(SC.RESULT);
  }

  return (
    <div style={PG}>
      <div style={WR}>
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}*{-webkit-tap-highlight-color:transparent;}button{-webkit-appearance:none;}`}</style>
        {midMsg && <MidMsg msg={midMsg} onClose={afterMid} />}

        {/* ══ INTRO ══ */}
        {sc === SC.INTRO && (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '8px', padding: '10px 0 4px' }}>
              <div style={{ fontSize: '9.5px', letterSpacing: '5px', color: 'rgba(206,147,216,0.55)', textTransform: 'uppercase', marginBottom: '14px', animation: 'fadeUp 0.5s ease both' }}>라온단미 · 심리 독립 테스트</div>
              <ImgSlot label="브랜드 이미지 (손글씨 · 오브제)" h={64} />
              <h1 style={{ fontSize: 'clamp(26px,7vw,36px)', fontWeight: 900, lineHeight: 1.15, letterSpacing: '-1.5px', marginBottom: '8px', animation: 'fadeUp 0.6s ease 0.1s both' }}>
                나는 왜<br /><span style={{ color: '#CE93D8' }}>항상 이럴까?</span>
              </h1>
              <p style={{ fontSize: 'clamp(13px,3.5vw,15px)', color: 'rgba(255,255,255,0.48)', lineHeight: 1.75, animation: 'fadeUp 0.6s ease 0.2s both', marginBottom: '6px' }}>
                이 질문을 한 번이라도 해본 적 있다면
              </p>
              <p style={{ fontSize: 'clamp(12px,3vw,13.5px)', color: 'rgba(255,255,255,0.35)', lineHeight: 1.7, animation: 'fadeUp 0.6s ease 0.25s both' }}>
                10개 심리 지표로 패턴의 원인과 변화 경로를 찾아드립니다
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '7px', margin: '14px 0', animation: 'fadeUp 0.6s ease 0.3s both' }}>
              {[
                { icon: '◉', t: '원인 파악', d: '왜 반복되는지' },
                { icon: '◈', t: '패턴 구조', d: '어디서 작동하는지' },
                { icon: '◇', t: '변화 경로', d: '어떻게 달라지는지' },
              ].map((item, i) => (
                <div key={i} style={{ background: 'rgba(206,147,216,0.07)', border: '1px solid rgba(206,147,216,0.14)', borderRadius: '10px', padding: '10px 8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '16px', color: '#CE93D8', marginBottom: '4px' }}>{item.icon}</div>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>{item.t}</div>
                  <div style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.4)' }}>{item.d}</div>
                </div>
              ))}
            </div>

            <div style={{ ...LBL, textAlign: 'center', marginBottom: '10px', color: 'rgba(255,255,255,0.32)', animation: 'fadeUp 0.6s ease 0.35s both' }}>혹시 이런 감각이 있나요?</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '16px', animation: 'fadeUp 0.6s ease 0.4s both' }}>
              {CHECKLIST.map((item, i) => (<CkBtn key={i} active={ckd.includes(i)} onClick={() => setCkd(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])}>{item}</CkBtn>))}
            </div>

            <div style={{ background: 'rgba(206,147,216,0.07)', border: '1px solid rgba(206,147,216,0.15)', borderRadius: '14px', padding: '16px 17px', marginBottom: '16px', textAlign: 'center' }}>
              <p style={{ fontSize: '14.5px', lineHeight: 1.85, color: 'rgba(255,255,255,0.82)', marginBottom: '6px' }}>
                {ckd.length === 0 && '하나라도 내 얘기다 싶은 게 있다면'}
                {ckd.length >= 1 && ckd.length <= 3 && ckd.length + '가지가 마음에 걸렸군요.'}
                {ckd.length >= 4 && ckd.length <= 7 && ckd.length + '가지나 해당됐군요.'}
                {ckd.length >= 8 && '상당히 많은 부분이 해당됐군요.'}
              </p>
              <p style={{ fontSize: '14.5px', lineHeight: 1.85, color: 'rgba(255,255,255,0.82)', marginBottom: '6px' }}>
                그건 의지가 약해서도, 성격이 이상해서도 아니에요.<br />
                <strong style={{ color: '#CE93D8' }}>오래된 패턴이 지금도 작동하고 있는 거예요.</strong>
              </p>
              <p style={{ fontSize: '13px', lineHeight: 1.8, color: 'rgba(255,255,255,0.5)', marginBottom: '8px' }}>
                12분 동안 나 자신을 탐구해볼까요?<br />
                <span style={{ color: 'rgba(255,255,255,0.38)' }}>10개 지표 · 62문항으로 지금 바로 시작할 수 있어요.</span>
              </p>
              <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', lineHeight: 1.5 }}>이 테스트를 마치고 나면, 내가 왜 이러는지 처음으로 언어로 보게 될 거예요.</p>
            </div>

            <button style={BTN} onClick={() => setSc(SC.CAREGIVER)}>지금 바로 확인하기 →</button>
            <div style={{ marginTop: '10px', padding: '10px 12px', background: 'rgba(255,200,0,0.03)', border: '1px solid rgba(255,200,0,0.08)', borderRadius: '8px', fontSize: '10.5px', color: 'rgba(255,255,255,0.27)', lineHeight: 1.7 }}>
              ※ 이 테스트는 심리 패턴 파악을 위한 자기계발 도구입니다. 의료적 진단 및 전문 심리상담을 대체하지 않습니다.
            </div>
            <BizFtr go={goLegal} />
          </div>
        )}

        {/* ══ CAREGIVER ══ */}
        {sc === SC.CAREGIVER && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <button onClick={goBack} style={BACK}>←</button>
              <span style={{ ...LBL, letterSpacing: '3px' }}>시작 전 확인</span>
            </div>
            <div style={CD(false)}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '11px' }}>만 18세 이전을 기준으로 응답해주세요</div>
              <div style={{ fontSize: 'clamp(15px,3.5vw,17px)', fontWeight: 600, lineHeight: 1.7 }}>나를 주로 돌봐준 사람은 누구였나요?<br /><span style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.33)', fontWeight: 400 }}>중복 선택 가능합니다</span></div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '15px' }}>
              {CAREGIVER_OPTS.map(o => { const a = care.includes(o.id); return (<button key={o.id} onClick={() => setCare(p => p.includes(o.id) ? p.filter(x => x !== o.id) : [...p, o.id])} style={{ background: a ? 'rgba(206,147,216,0.13)' : 'rgba(255,255,255,0.04)', border: '1.5px solid ' + (a ? '#CE93D8' : 'rgba(255,255,255,0.09)'), borderRadius: '11px', padding: '12px 14px', color: a ? '#fff' : 'rgba(255,255,255,0.67)', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '11px', width: '100%', textAlign: 'left' }}><div style={{ width: '17px', height: '17px', borderRadius: '4px', border: '1.5px solid ' + (a ? '#CE93D8' : 'rgba(255,255,255,0.18)'), background: a ? '#CE93D8' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: 700 }}>{a ? '✓' : ''}</div>{o.label}</button>); })}
            </div>
            <button style={{ ...BTN, opacity: care.length === 0 ? 0.42 : 1 }} disabled={care.length === 0} onClick={() => setSc(SC.P0)}>다음 →</button>
          </div>
        )}

        {/* ══ PART 0 ══ */}
        {sc === SC.P0 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <button onClick={goBack} style={BACK}>←</button>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ ...LBL, color: '#CE93D8', letterSpacing: '2px' }}>성장 환경</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)' }}>{p0i + 1} / {P0Q.length}</span>
                </div>
                <Prog pct={(p0i + 1) / P0Q.length * 100} />
              </div>
            </div>
            <div style={CD(anim)}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', marginBottom: '12px' }}>어린 시절 기준으로 응답해주세요</div>
              <div style={{ fontSize: 'clamp(14px,3.2vw,16.5px)', fontWeight: 600, lineHeight: 1.9 }}>{P0Q[p0i]}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {P0_OPTS.map(o => <OBtn key={o.v} active={sel === o.v} onClick={() => pick0(o.v)}>{o.l}</OBtn>)}
            </div>
          </div>
        )}

        {/* ══ PART 1 ══ */}
        {sc === SC.P1 && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <button onClick={goBack} style={BACK}>←</button>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.33)' }}>{doneN + 1} / {totalQs}</span>
                  <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)' }}>{Math.round(doneSF / totalQs * 100)}%</span>
                </div>
                <Prog pct={doneSF / totalQs * 100} color={DIMS[dimi].color} />
              </div>
            </div>
            <div style={CD(anim)}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.26)', marginBottom: '12px' }}>현재를 기준으로 솔직하게 응답해주세요</div>
              <div style={{ fontSize: 'clamp(13px,3vw,16px)', fontWeight: 600, lineHeight: 1.95 }}>{DIMS[dimi].qs[qi]}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
              {OPTS.map(o => <OBtn key={o.v} active={sel === o.v} color={DIMS[dimi].color} onClick={() => pick1(o.v)}>{o.l}</OBtn>)}
            </div>
            <div style={{ marginTop: '13px', display: 'flex', gap: '2px' }}>
              {DIMS.map((d, i) => <div key={d.id} style={{ flex: 1, height: '2px', borderRadius: '2px', background: i < dimi ? d.color : i === dimi ? d.color + 'AA' : 'rgba(255,255,255,0.06)', transition: 'background 0.3s' }} />)}
            </div>
          </div>
        )}

        {/* ══ EMAIL ══ */}
        {sc === SC.EMAIL && (
          <div style={{ textAlign: 'center' }}>
            <button onClick={goBack} style={{ ...GHOST, width: 'auto', padding: '8px 15px', marginBottom: '16px', marginTop: 0 }}>← 이전 질문으로</button>
            <div style={{ fontSize: '24px', marginBottom: '9px', color: '#CE93D8', fontWeight: 300 }}>✦</div>
            <h2 style={{ fontSize: '21px', fontWeight: 800, marginBottom: '5px', letterSpacing: '-0.5px' }}>62문항 완료</h2>
            <p style={{ color: 'rgba(255,255,255,0.4)', marginBottom: '18px', lineHeight: 1.7, fontSize: '13px' }}>이메일을 입력하면 무료 결과를 바로 확인할 수 있어요</p>
            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '11px', marginBottom: '13px' }}>
              <div><label style={{ ...LBL, display: 'block', marginBottom: '5px', color: '#CE93D8' }}>닉네임 (선택)</label><input value={nick} onChange={e => setNick(e.target.value)} placeholder="예: 별빛, 익명" style={INP} /></div>
              <div>
                <label style={{ ...LBL, display: 'block', marginBottom: '5px', color: '#CE93D8' }}>이메일 주소 <span style={{ color: '#EF5350' }}>*</span></label>
                <input value={email} onChange={e => { setEmail(e.target.value); setErr(''); }} placeholder="example@email.com" type="email" style={{ ...INP, borderColor: err ? '#EF5350' : 'rgba(206,147,216,0.3)' }} />
                {err && <div style={{ color: '#EF5350', fontSize: '12px', marginTop: '5px' }}>{err}</div>}
              </div>
              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(206,147,216,0.1)', borderRadius: '10px', padding: '12px 14px' }}>
                <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', marginBottom: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={agreed} onChange={e => { setAgreed(e.target.checked); setErr(''); }} style={{ marginTop: '2px' }} />
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}><strong style={{ color: 'rgba(255,255,255,0.75)' }}>[필수] 개인정보 수집 이용 동의</strong><br />테스트 결과 발송 목적으로만 사용합니다. <button onClick={() => goLegal(SC.PRIVACY)} style={{ background: 'none', border: 'none', color: '#CE93D8', fontSize: '11px', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>내용 보기</button></span>
                </label>
                <label style={{ display: 'flex', gap: '10px', alignItems: 'flex-start', cursor: 'pointer' }}>
                  <input type="checkbox" checked={mkt} onChange={e => setMkt(e.target.checked)} style={{ marginTop: '2px' }} />
                  <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.65 }}><strong style={{ color: 'rgba(255,255,255,0.75)' }}>[선택] 마케팅 정보 수신 동의</strong></span>
                </label>
              </div>
            </div>
            <button style={BTN} onClick={submit}>무료 결과 확인하기 →</button>
          </div>
        )}

        {/* ══ LOADING ══ */}
        {sc === SC.LOADING && (
          <div style={{ textAlign: 'center', paddingTop: '50px' }}>
            <div style={{ width: '46px', height: '46px', border: '2px solid rgba(206,147,216,0.1)', borderTopColor: '#CE93D8', borderRadius: '50%', margin: '0 auto 17px', animation: 'spin 1s linear infinite' }} />
            <h3 style={{ fontSize: '16px', marginBottom: '6px', fontWeight: 700 }}>10개 패턴 분석 중</h3>
            <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: '13px' }}>62개 응답을 종합해 맞춤 분석을 구성하고 있어요</p>
          </div>
        )}

        {/* ══ FREE RESULT ══ */}
        {sc === SC.RESULT && scores && (() => {
          const ti = getType(scores.total);
          const sorted = [...scores.dimScores].sort((a, b) => b.score - a.score);
          const radarData = scores.dimScores.map(d => ({ subject: d.name.slice(0, 4), score: Math.round(d.score / d.max * 20), fullMark: 20 }));
          const trigText = getTrigger(scores);

          return (
            <div>
              <div style={{ ...LBL, textAlign: 'center', marginBottom: '11px' }}>진단 완료 · 무료 결과</div>

              <div style={{ background: ti.bg, border: '1.5px solid ' + ti.border + '50', borderRadius: '14px', padding: '18px', marginBottom: '13px', textAlign: 'center' }}>
                <div style={{ fontSize: '24px', color: ti.color, fontWeight: 900, fontFamily: 'serif', marginBottom: '3px' }}>{ti.symbol}</div>
                <div style={{ fontSize: '18px', fontWeight: 900, color: ti.color, letterSpacing: '-0.5px', marginBottom: '2px' }}>{ti.type} — {ti.detail}</div>
                <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.3)' }}>총점 {scores.total} / {maxTotal}</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px', marginBottom: '12px' }}>
                <div style={{ ...LBL, marginBottom: '10px' }}>10가지 패턴 점수</div>
                {sorted.map(d => {
                  const lv = getLev(d.score, d.max, d.positive);
                  return (<div key={d.id} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'rgba(255,255,255,0.82)' }}>{d.name}</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.26)' }}>{d.score}/{d.max}</span>
                        <span style={{ background: lv.color + '1E', color: lv.color, border: '1px solid ' + lv.color + '50', borderRadius: '7px', padding: '1px 8px', fontSize: '9.5px', fontWeight: 700 }}>{lv.label}</span>
                      </div>
                    </div>
                    <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px' }}>
                      <div style={{ height: '100%', width: d.score / d.max * 100 + '%', background: lv.color, borderRadius: '3px', transition: 'width 0.6s', opacity: 0.78 }} />
                    </div>
                  </div>);
                })}
              </div>

              <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '12px', padding: '12px', marginBottom: '13px' }}>
                <ResponsiveContainer width="100%" height={175}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.32)', fontSize: 9 }} />
                    <Radar dataKey="score" stroke="#CE93D8" fill="#CE93D8" fillOpacity={0.12} strokeWidth={1.5} />
                    <Tooltip contentStyle={{ background: '#1A0535', border: '1px solid rgba(206,147,216,0.22)', borderRadius: '8px', color: '#fff', fontSize: '11px' }} formatter={v => [v + '점', '']} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(206,147,216,0.18)', borderRadius: '12px', padding: '16px', marginBottom: '13px' }}>
                <div style={{ ...LBL, color: '#CE93D8', marginBottom: '9px' }}>이 패턴이 말하는 것</div>
                <p style={{ fontSize: '13.5px', lineHeight: 1.95, color: 'rgba(255,255,255,0.82)', marginBottom: '10px' }}>{insight || trigText}</p>
                {letter && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.07)', paddingTop: '10px', marginTop: '4px' }}>
                    <div style={{ fontSize: '9px', color: 'rgba(206,147,216,0.5)', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '7px' }}>라온단미의 한 줄</div>
                    <p style={{ fontSize: '13px', lineHeight: 1.9, color: 'rgba(255,255,255,0.65)', fontStyle: 'italic' }}>{letter}</p>
                  </div>
                )}
              </div>

              <button onClick={() => shareResult(ti.type + ' ' + ti.detail)} style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.11)', borderRadius: '11px', padding: '11px', color: 'rgba(255,255,255,0.6)', fontSize: '13px', cursor: 'pointer', marginBottom: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{ fontSize: '14px' }}>↗</span> 내 결과 공유하기
              </button>

              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(206,147,216,0.18)', borderRadius: '13px', padding: '17px', marginBottom: '12px' }}>
                <div style={{ ...LBL, color: 'rgba(255,255,255,0.4)', marginBottom: '9px' }}>이 결과로는 아직 반쪽이에요</div>
                <p style={{ fontSize: '13.5px', lineHeight: 1.9, color: 'rgba(255,255,255,0.78)', marginBottom: '10px' }}>
                  지금 보이는 점수는 <strong style={{ color: '#CE93D8' }}>무엇이 높은지</strong>를 알려줘요.<br />
                  하지만 더 중요한 질문이 남아 있어요.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', marginBottom: '12px' }}>
                  {[
                    { icon: '◉', q: '왜 이 패턴이 나에게 생겼는가?', d: '어린 시절 어떤 환경이 지금의 이 구조를 만들었는지' },
                    { icon: '◈', q: '지금 삶의 어디서 이게 작동하는가?', d: '관계·일·돈·몸 — 4개 영역에서 이 패턴이 반복되는 구체적인 장면' },
                    { icon: '◇', q: '어떻게 달라질 수 있는가?', d: '신경과학·CBT·ACT 기반 이 패턴에 효과적인 실제 처방' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', gap: '10px', background: 'rgba(255,255,255,0.03)', borderRadius: '9px', padding: '10px 12px', alignItems: 'flex-start' }}>
                      <span style={{ color: '#CE93D8', fontSize: '14px', flexShrink: 0, marginTop: '1px' }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#fff', marginBottom: '2px' }}>{item.q}</div>
                        <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{item.d}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.52)', lineHeight: 1.8, marginBottom: '0' }}>
                  이 세 가지 질문에 대한 답이 담긴 심층 분석 리포트를 PDF로 받아볼 수 있어요.
                </p>
              </div>

              {timer.active && !timer.expired && (
                <div style={{ background: 'rgba(239,83,80,0.08)', border: '1px solid rgba(239,83,80,0.22)', borderRadius: '10px', padding: '10px 14px', marginBottom: '11px', textAlign: 'center' }}>
                  <div style={{ ...LBL, color: '#EF5350', marginBottom: '2px' }}>테스트 완료 후 1시간 한정</div>
                  <div style={{ fontSize: '22px', fontWeight: 900, color: '#fff', marginBottom: '2px', fontVariantNumeric: 'tabular-nums' }}>{timer.display}</div>
                  <div style={{ fontSize: '11.5px', color: 'rgba(255,255,255,0.45)' }}>이 시간 내 구매 시 <strong style={{ color: '#FFA726' }}>99,000원 → 69,000원</strong></div>
                </div>
              )}

              <div style={{ background: 'linear-gradient(135deg,rgba(106,27,154,0.16),rgba(156,39,176,0.1))', border: '1px solid rgba(206,147,216,0.2)', borderRadius: '14px', padding: '16px', marginBottom: '10px' }}>
                <div style={{ display: 'flex', gap: '7px' }}>
                  <button onClick={() => setSc(SC.BASIC)} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', padding: '13px 5px', color: 'rgba(255,255,255,0.68)', cursor: 'pointer', fontSize: '11.5px', lineHeight: 1.65, textAlign: 'center' }}>
                    내 패턴의 원인과<br />변화 경로 보기<br /><strong style={{ color: '#fff', fontSize: '14px' }}>9,900원</strong><br /><span style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.28)' }}>자세히 →</span>
                  </button>
                  <button onClick={() => setSc(SC.FULL)} style={{ flex: 1.3, background: 'linear-gradient(135deg,rgba(106,27,154,0.5),rgba(156,39,176,0.4))', border: '1px solid rgba(206,147,216,0.25)', borderRadius: '10px', padding: '13px 5px', color: '#fff', cursor: 'pointer', fontSize: '11.5px', lineHeight: 1.65, textAlign: 'center' }}>
                    라온단미에게<br />내 이야기 보내기<br />
                    {timer.active && !timer.expired
                      ? <span><s style={{ opacity: 0.4, fontSize: '10.5px' }}>99,000원</s><br /><strong style={{ fontSize: '14px', color: '#FFD54F' }}>69,000원</strong></span>
                      : <strong style={{ fontSize: '14px' }}>99,000원</strong>}
                    <br /><span style={{ fontSize: '9.5px', color: 'rgba(255,255,255,0.4)' }}>자세히 →</span>
                  </button>
                </div>
              </div>

              <button style={GHOST} onClick={reset}>처음부터 다시하기</button>
              <BizFtr go={goLegal} />
            </div>
          );
        })()}

        {/* ══ SALES BASIC ══ */}
        {sc === SC.BASIC && (
          <div>
            <button onClick={() => setSc(SC.RESULT)} style={{ ...BACK, marginBottom: '15px', fontSize: '13px', color: 'rgba(255,255,255,0.33)', display: 'flex', alignItems: 'center', gap: '5px' }}>← 무료 결과로</button>
            <ImgSlot label="분석 리포트 미리보기 이미지" h={88} />

            <div style={{ marginBottom: '16px' }}>
              <div style={{ ...LBL, color: '#CE93D8', marginBottom: '7px' }}>심층 분석 리포트</div>
              <h2 style={{ fontSize: 'clamp(18px,4vw,21px)', fontWeight: 900, lineHeight: 1.3, letterSpacing: '-0.5px', marginBottom: '9px' }}>
                점수를 알게 된 다음,<br /><em style={{ fontStyle: 'normal', color: '#CE93D8' }}>왜 그런지를 알게 될 때</em><br />비로소 달라지기 시작해요
              </h2>
              <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.9 }}>
                무료 결과에서 확인한 패턴 점수는 지금의 나를 보여줘요.<br />
                심층 분석 리포트는 그 패턴이 어디서 왔는지, 지금 어디서 작동하는지, 어떻게 달라질 수 있는지를 연구 기반으로 분석해드립니다.
              </p>
            </div>

            <div style={{ ...LBL, marginBottom: '11px' }}>리포트 구성 — 총 10페이지 이상</div>
            {[
              {
                t: '패턴 구조 분석',
                d: '10개 지표가 단순히 높고 낮은 것이 아니라, 서로 어떻게 연결되어 지금의 삶의 구조를 만드는지 분석합니다.',
                subs: [
                  '높게 나온 패턴이 다른 패턴에 어떤 영향을 주고 있는가',
                  '이 조합이 왜 이런 결과를 만드는가 — 패턴 간의 연결 구조',
                  '내가 느끼는 것들이 사실 같은 뿌리에서 나온 것일 수 있다는 인식',
                ]
              },
              {
                t: '핵심 역설과 숨겨진 구조',
                d: '가장 힘들게 하는 것이 사실은 내가 가장 잘 하는 것일 수 있어요. 표면적으로 모순처럼 보이는 패턴 조합에서 읽어낸 진실을 짚어드립니다.',
                subs: [
                  '스스로는 언어화하지 못했던 내면의 구조를 처음으로 글로 보게 됨',
                  '"아, 내가 왜 이러는지 이제 알 것 같다"는 감각을 목표로',
                  '이 역설이 관계와 일에서 어떻게 드러나는지 구체적 묘사',
                ]
              },
              {
                t: '삶의 4영역 영향 분석',
                d: '이 패턴들이 지금 삶의 어디에서 어떻게 반복되고 있는지 구체적으로 분석합니다.',
                subs: [
                  '관계 — 가까운 사람들과의 반복되는 마찰의 원인',
                  '일 — 퍼포먼스와 에너지 소진의 구조',
                  '돈 — 돈에 대한 태도와 결정 방식에 미치는 영향',
                  '몸 — 심리적 패턴이 신체 신호로 나타나는 방식',
                ]
              },
              {
                t: '연구 기반 인지행동 처방',
                d: '이 패턴 구조에 실제로 효과적인 방법만 선별해 제공합니다. 일반적인 조언이 아니라, 당신의 점수 조합에 맞는 처방이에요.',
                subs: [
                  'CBT(인지행동치료) 기반 — 자동화된 사고 패턴 재조정',
                  'ACT(수용전념치료) 기반 — 심리적 유연성 높이는 법',
                  '자기자비 연습 — 자신에게 적용하는 기준을 바꾸는 방법',
                  '신경과학 기반 — 오래된 패턴 회로를 재조정하는 원리',
                ]
              },
              {
                t: '21일 행동 플랜',
                d: '분석에서 그치지 않고, 오늘부터 실제로 다르게 살 수 있는 3주 실천 계획을 제공합니다.',
                subs: [
                  '1주차: 인식 — 이 패턴이 작동하는 순간 알아채기',
                  '2주차: 개입 — 자동 반응 앞에 1초 멈추는 연습',
                  '3주차: 재조정 — 새로운 방식으로 반응하는 습관 형성',
                  '패턴 점수에 따라 개인화된 구체적인 일일 행동 제시',
                ]
              },
              {
                t: '라온단미의 편지 전문',
                d: '이 패턴 구조를 가진 사람에게 라온단미가 직접 쓴 맞춤 편지예요. 무료 결과에서 잠깐 보였던 그 편지의 전체 내용입니다.',
                subs: [
                  '이 패턴을 가진 사람이 가장 듣고 싶었던 말',
                  '같은 길을 먼저 걸어온 사람의 시선으로',
                  '오늘 당장 해볼 수 있는 것 하나로 마무리',
                ]
              },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: '9px', padding: '13px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: '11px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '9px', marginBottom: '7px' }}>
                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: 'rgba(206,147,216,0.15)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: '#CE93D8', fontWeight: 700, marginTop: '2px' }}>✓</div>
                  <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#fff' }}>{item.t}</div>
                </div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.52)', lineHeight: 1.75, marginBottom: '7px', paddingLeft: '27px' }}>{item.d}</p>
                <div style={{ paddingLeft: '27px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {item.subs.map((sub, j) => (
                    <div key={j} style={{ display: 'flex', gap: '6px', alignItems: 'flex-start' }}>
                      <span style={{ color: 'rgba(206,147,216,0.5)', fontSize: '9px', marginTop: '3px', flexShrink: 0 }}>▸</span>
                      <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.65 }}>{sub}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <RevHolder />

            <div style={{ textAlign: 'center', padding: '15px 0 11px' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginBottom: '2px' }}>분석 리포트 · PDF 즉시 이메일 발송</div>
              <div style={{ fontSize: '28pt', fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>9,900원</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.25)', marginTop: '2px' }}>커피 두 잔 가격으로, 반복되는 패턴의 전체 구조를 처음으로 확인하세요</div>
            </div>

            <button style={BTN} onClick={() => setSc(SC.PAY)}>내 패턴의 전체 구조 보기 — 9,900원</button>

            <div style={{ marginTop: '12px', background: 'linear-gradient(135deg,rgba(255,213,79,0.06),rgba(106,27,154,0.08))', border: '1px solid rgba(255,213,79,0.16)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ fontSize: '10px', color: '#FFD54F', letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '7px' }}>더 깊이 들어가고 싶다면</div>
              <p style={{ fontSize: '12.5px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8, marginBottom: '9px' }}>
                분석 리포트로 패턴을 <strong style={{ color: 'rgba(255,255,255,0.82)' }}>이해하는 것</strong>에서 나아가,<br />
                지금 내가 겪고 있는 <strong style={{ color: 'rgba(255,255,255,0.82)' }}>실제 고민에 대한 답</strong>이 필요하다면 — 풀케어 패키지에서는 당신의 사연을 직접 접수받아요. 라온단미가 결과와 사연을 함께 읽고 직접 쓴 편지를 드립니다.
              </p>
              <button onClick={() => setSc(SC.FULL)} style={{ width: '100%', background: 'rgba(255,213,79,0.1)', border: '1px solid rgba(255,213,79,0.25)', borderRadius: '10px', padding: '12px', color: '#FFD54F', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
                풀케어 패키지 자세히 보기 →
              </button>
            </div>

            <div style={{ marginTop: '13px' }}><div style={{ ...LBL, marginBottom: '7px' }}>자주 묻는 질문</div><FAQ items={BASIC_FAQ} /></div>
            <div style={{ marginTop: '9px', fontSize: '10.5px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.7 }}>결제 완료 즉시 이메일로 발송됩니다<br />디지털 콘텐츠 특성상 발송 후 환불이 어렵습니다</div>
            <BizFtr go={goLegal} />
          </div>
        )}

        {/* ══ SALES FULL ══ */}
        {sc === SC.FULL && scores && (() => {
          const ti = getType(scores.total);
          return (
            <div>
              <button onClick={() => setSc(SC.RESULT)} style={{ ...BACK, marginBottom: '15px', fontSize: '13px', color: 'rgba(255,255,255,0.33)' }}>← 무료 결과로</button>
              {timer.active && !timer.expired && (
                <div style={{ background: 'rgba(239,83,80,0.09)', border: '1px solid rgba(239,83,80,0.22)', borderRadius: '9px', padding: '9px 13px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '10.5px', color: 'rgba(255,255,255,0.4)' }}>1시간 한정 할인</div>
                  <div style={{ fontSize: '15px', fontWeight: 900, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{timer.display}</div>
                </div>
              )}
              <ImgSlot label="편지 · 손 이미지 (따뜻한 톤)" h={108} />
              <div style={{ marginBottom: '16px' }}>
                <div style={{ ...LBL, color: '#CE93D8', marginBottom: '7px' }}>풀케어 패키지</div>
                <h2 style={{ fontSize: 'clamp(18px,4vw,21px)', fontWeight: 900, lineHeight: 1.3, letterSpacing: '-0.5px', marginBottom: '9px' }}>
                  분석을 읽고,<br />라온단미가 직접 <em style={{ fontStyle: 'normal', color: '#FFD54F' }}>당신의 이야기에 답합니다</em>
                </h2>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', lineHeight: 1.9 }}>분석 리포트에 더해, 지금 당신의 이야기를 라온단미가 직접 읽고 — 더 나은 방향을 담아 손수 쓴 편지를 보내드립니다.</p>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(206,147,216,0.18)', borderRadius: '14px', padding: '18px', marginBottom: '14px' }}>
                <div style={{ ...LBL, color: '#CE93D8', marginBottom: '11px' }}>라온단미는 누구인가요</div>
                <ImgSlot label="손 · 뒷모습 이미지" h={76} />

                <p style={{ fontSize: '13px', lineHeight: 2.0, color: 'rgba(255,255,255,0.75)', marginBottom: '10px' }}>
                  행복한 순간이 오면 이상하게 불안해졌어요.<br />
                  <em style={{ fontStyle: 'normal', color: 'rgba(255,255,255,0.45)' }}>"또 얼마나 큰 고통이 오려고 이런 행복을 주는 걸까."</em><br />
                  행복이 불행의 전조증상처럼 느껴지던 시절이 있었어요.
                </p>

                <p style={{ fontSize: '13px', lineHeight: 2.0, color: 'rgba(255,255,255,0.75)', marginBottom: '10px' }}>
                  어린 시절부터 이어진 불안정한 환경 속에서 자랐어요. 그리고 성인이 된 후, 예상치 못한 큰 사건들을 겪으며 결국 PTSD 진단을 받았어요. 주변의 권유로 처음 상담을 받으러 갔을 때, 상담사 선생님이 이런 질문을 던졌어요.
                </p>

                <div style={{ background: 'rgba(206,147,216,0.07)', border: '1px solid rgba(206,147,216,0.15)', borderRadius: '10px', padding: '13px 14px', marginBottom: '10px' }}>
                  <p style={{ fontSize: '13px', lineHeight: 1.95, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>
                    "가장 어린 시절 기억 속 아버지는 어떤 분이셨나요?<br />
                    초등학교 다닐 때는요? 성인이 된 후에는요?"
                  </p>
                </div>

                <p style={{ fontSize: '13px', lineHeight: 2.0, color: 'rgba(255,255,255,0.75)', marginBottom: '10px' }}>
                  같은 아버지에 대해 시기별로 이야기하면서, 저는 놀라운 것을 경험했어요. 내가 묘사하는 그분은 마치 다른 사람 같았어요. 슈퍼맨에서, 저에게 상처를 준 사람으로, 그리고 저를 사랑하는 사람으로. 말하는 동안 제 감정도 계속 바뀌었어요.<br />
                  그 순간 처음으로 울었어요. 그리고 처음으로 — <strong style={{ color: '#CE93D8' }}>내가 왜 이러는지 알 것 같았어요.</strong>
                </p>

                <p style={{ fontSize: '13px', lineHeight: 2.0, color: 'rgba(255,255,255,0.75)', marginBottom: '10px' }}>
                  두 달의 상담이 많은 것을 바꿔줬어요. 하지만 시간이 지나면 비슷한 패턴이 다시 반복됐어요. 표면의 감정을 정리하는 데는 도움이 됐지만, 곰팡이 핀 벽에 새 시트지를 붙이는 느낌이었어요. 계절이 지나면 다시 검은 점이 올라왔어요. 저는 표면이 아닌 <strong style={{ color: 'rgba(255,255,255,0.9)' }}>본질적인 곰팡이를 제거하는 방법</strong>을 찾고 싶었어요.
                </p>

                <p style={{ fontSize: '13px', lineHeight: 2.0, color: 'rgba(255,255,255,0.75)', marginBottom: '10px' }}>
                  10년이 넘는 시간 동안 내담자로서, 그리고 주변의 아파하는 사람들 곁에 있으면서 하나의 패턴을 발견했어요. 많은 사람들이 수십 년이 지났어도 상처받았던 그 시절 아이의 내면으로 지금을 살아가고 있다는 것. 경제적인 이유로, 방법을 몰라서, "이게 상담받을 정도야?"라는 망설임으로 — 도움을 받지 못하고 있었어요.
                </p>

                <p style={{ fontSize: '13px', lineHeight: 2.0, color: 'rgba(255,255,255,0.75)', marginBottom: '10px' }}>
                  저는 그 사람들이 마음에 걸렸어요. 아파봤기 때문에 그 감각이 어떤 것인지 알기 때문에. 지금도 저는 여전히 배우고 있어요. 과도한 스트레스 상황에서 불안과 공황이 올 때도 있어요. 하지만 이제는 그것이 올 때 감기가 걸린 것처럼, 곧 건강한 나로 돌아오리라는 믿음으로 호흡을 가다듬어요.
                </p>

                <p style={{ fontSize: '13px', lineHeight: 2.0, color: 'rgba(255,255,255,0.75)', marginBottom: '0' }}>
                  하늘은 여전히 파랗고, 꽃은 예쁘게 피고, 새들은 자유롭게 날고 있어요. 저는 어제보다 오늘이 행복한 사람이 되기로 했어요. 그렇게 살기로 했고, 실제로 무던히 저 자신을 사랑하는 방법을 꾸준히 실천해나가며 배우고 있기 때문이에요.
                </p>

                <div style={{ marginTop: '12px', paddingTop: '11px', borderTop: '1px solid rgba(255,255,255,0.07)', fontSize: '12px', color: 'rgba(255,255,255,0.42)', lineHeight: 1.8 }}>
                  <strong style={{ color: 'rgba(255,255,255,0.58)' }}>라온단미 —</strong> 즐겁고(라온) 사랑스럽게(단미) 사는 것. 이것이 제 삶의 방향이고, 이 프로젝트를 함께하는 모든 분께도 그 씨앗을 나누고 싶어요.
                </div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '11px', padding: '12px 14px', marginBottom: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ ...LBL, marginBottom: '8px' }}>분석 리포트 전체 포함</div>
                {['패턴 구조 분석', '핵심 역설과 숨겨진 구조', '삶의 4영역 영향', '연구 기반 처방', '21일 행동 플랜', '라온단미 편지 전문'].map((it, i) => (
                  <div key={i} style={{ display: 'flex', gap: '7px', marginBottom: '5px', fontSize: '12.5px', color: 'rgba(255,255,255,0.45)', alignItems: 'center' }}><span style={{ color: '#CE93D8', fontSize: '9px', flexShrink: 0 }}>✓</span>{it}</div>
                ))}
              </div>

              <div style={{ ...LBL, color: '#FFD54F', marginBottom: '8px' }}>풀케어만의 추가 구성</div>
              <div style={{ padding: '15px', background: 'rgba(255,213,79,0.05)', borderRadius: '11px', marginBottom: '8px', border: '1px solid rgba(255,213,79,0.15)' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#FFD54F', marginBottom: '7px' }}>라온단미의 사연 답장 편지</div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.52)', lineHeight: 1.85, marginBottom: '8px' }}>구매 후 발송되는 양식에 지금 가장 힘든 것, 반복되는 상황, 달라지고 싶은 것을 자유롭게 적어 보내주세요. 라온단미가 테스트 결과와 사연을 함께 읽고 직접 쓴 편지를 48시간 내 보내드립니다.</p>
                <div style={{ fontSize: '11px', color: 'rgba(255,213,79,0.58)', lineHeight: 1.65, background: 'rgba(255,213,79,0.04)', padding: '7px 9px', borderRadius: '7px' }}>전문 심리상담이 아닌, 같은 길을 먼저 걸어온 사람이 보내는 진심 어린 편지입니다.</div>
              </div>
              <div style={{ padding: '14px', background: 'rgba(255,255,255,0.03)', borderRadius: '11px', marginBottom: '14px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#fff', marginBottom: '5px' }}>21일 후, 라온단미가 먼저 안부를 묻습니다</div>
                <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.46)', lineHeight: 1.85, marginBottom: 0 }}>21일 행동 플랜이 끝난 직후, 라온단미가 직접 안부 이메일을 보내드립니다. <em style={{ fontStyle: 'normal', color: 'rgba(255,255,255,0.28)' }}>"요즘 어때요? 달라진 것이 있었나요?"</em> — 변화는 혼자 확인하는 것보다 누군가와 나눌 때 더 오래 지속됩니다.</p>
              </div>

              <RevHolder />

              <div style={{ textAlign: 'center', padding: '15px 0 11px' }}>
                {timer.active && !timer.expired ? (
                  <div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.27)', textDecoration: 'line-through', marginBottom: '2px' }}>정가 99,000원</div>
                    <div style={{ fontSize: '28pt', fontWeight: 900, color: '#FFD54F', letterSpacing: '-1px' }}>69,000원</div>
                    <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.27)', marginTop: '2px' }}>30,000원 할인</div>
                  </div>
                ) : (
                  <div style={{ fontSize: '28pt', fontWeight: 900, color: '#fff', letterSpacing: '-1px' }}>99,000원</div>
                )}
              </div>

              <button style={BTN2} onClick={() => setSc(SC.PAY)}>
                라온단미에게 내 이야기 보내기 — {timer.active && !timer.expired ? '69,000원' : '99,000원'}
              </button>

              <div style={{ marginTop: '13px' }}><div style={{ ...LBL, marginBottom: '7px' }}>자주 묻는 질문</div><FAQ items={FULL_FAQ} /></div>
              <div style={{ marginTop: '9px', fontSize: '10.5px', color: 'rgba(255,255,255,0.2)', textAlign: 'center', lineHeight: 1.75 }}>
                사연 답장 편지 발송: 결제 후 48시간 이내<br />
                본 서비스는 자기계발 목적 콘텐츠이며 전문 심리상담을 대체하지 않습니다
              </div>
              <button style={GHOST} onClick={() => setSc(SC.BASIC)}>분석 리포트만 (9,900원) 보기 →</button>
              <BizFtr go={goLegal} />
            </div>
          );
        })()}

        {/* ══ PAY ══ */}
        {sc === SC.PAY && (
          <div>
            <div style={{ ...LBL, textAlign: 'center', marginBottom: '13px' }}>결제</div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(206,147,216,0.16)', borderRadius: '13px', padding: '19px', marginBottom: '15px', textAlign: 'center' }}>
              <div style={{ fontSize: '15px', fontWeight: 800, marginBottom: '7px' }}>결제 연동 준비 중</div>
              <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.46)', lineHeight: 1.75, marginBottom: '12px' }}>곧 카카오페이 · 토스페이 · 카드 결제가 가능해집니다.<br />지금 바로 구매를 원하신다면 아래로 문의해 주세요.</div>
              <a href={'mailto:' + BIZ.email + '?subject=라온단미 결과지 구매 문의'} style={{ display: 'block', padding: '10px', background: 'rgba(206,147,216,0.08)', borderRadius: '8px', fontSize: '13px', color: '#CE93D8', fontWeight: 700, textDecoration: 'none' }}>{BIZ.email}</a>
            </div>
            <button style={GHOST} onClick={() => setSc(SC.RESULT)}>← 무료 결과로 돌아가기</button>
            <BizFtr go={goLegal} />
          </div>
        )}

        {/* ══ 법적 페이지 ══ */}
        {sc === SC.PRIVACY && (
          <Legal title="개인정보처리방침" onBack={backLegal}>
            <p style={{ marginBottom: '9px' }}><strong style={{ color: 'rgba(255,255,255,0.78)' }}>라온단미</strong>는 이용자의 개인정보를 중요시하며 「개인정보 보호법」에 따라 아래와 같이 처리합니다.</p>
            <p style={{ marginBottom: '6px' }}><strong style={{ color: 'rgba(255,255,255,0.68)' }}>1. 수집 항목</strong><br />이메일 주소, 닉네임(선택), 테스트 응답 데이터</p>
            <p style={{ marginBottom: '6px' }}><strong style={{ color: 'rgba(255,255,255,0.68)' }}>2. 수집 목적</strong><br />테스트 결과 발송, 서비스 이행, 마케팅 정보 제공(동의 시)</p>
            <p style={{ marginBottom: '6px' }}><strong style={{ color: 'rgba(255,255,255,0.68)' }}>3. 보유 기간</strong><br />서비스 이용 종료 또는 동의 철회 시까지. 거래 기록은 전자상거래법에 따라 5년 보관.</p>
            <p style={{ marginBottom: '6px' }}><strong style={{ color: 'rgba(255,255,255,0.68)' }}>4. 제3자 제공</strong><br />동의 없이 제3자에게 제공하지 않습니다.</p>
            <p style={{ marginBottom: '6px' }}><strong style={{ color: 'rgba(255,255,255,0.68)' }}>5. 이용자 권리</strong><br />언제든지 조회, 수정, 삭제, 처리 정지 요청 가능합니다.</p>
            <p style={{ marginBottom: '6px' }}><strong style={{ color: 'rgba(255,255,255,0.68)' }}>6. 책임자</strong><br />이메일: {BIZ.email}</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', marginTop: '9px' }}>시행일: 2026년 1월 1일</p>
          </Legal>
        )}
        {sc === SC.REFUND && (
          <Legal title="환불 및 취소 정책" onBack={backLegal}>
            <p style={{ marginBottom: '9px' }}>디지털 콘텐츠 특성상 콘텐츠 발송 또는 서비스 제공이 시작된 이후에는 환불이 제한됩니다.</p>
            <p style={{ marginBottom: '6px' }}><strong style={{ color: 'rgba(255,255,255,0.68)' }}>분석 리포트 (9,900원)</strong></p>
            <p style={{ marginBottom: '9px' }}>- 이메일 발송 전: 전액 환불<br />- 이메일 발송 후: 환불 불가<br />- 당사 귀책 사유: 전액 환불</p>
            <p style={{ marginBottom: '6px' }}><strong style={{ color: 'rgba(255,255,255,0.68)' }}>풀케어 패키지 (69,000원 / 99,000원)</strong></p>
            <p style={{ marginBottom: '9px' }}>- 사연 접수 전: 전액 환불<br />- 편지 작성 시작 후: 환불 불가<br />- 당사 귀책 사유: 전액 환불</p>
            <p style={{ marginBottom: '6px' }}><strong style={{ color: 'rgba(255,255,255,0.68)' }}>환불 신청</strong></p>
            <p>{BIZ.email}로 주문 정보와 함께 신청 시 영업일 3일 이내 처리합니다.</p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.28)', marginTop: '9px' }}>시행일: 2026년 1월 1일</p>
          </Legal>
        )}
        {sc === SC.TERMS && (
          <Legal title="이용약관" onBack={backLegal}>
            <p style={{ marginBottom: '9px' }}><strong style={{ color: 'rgba(255,255,255,0.78)' }}>제1조 목적</strong><br />라온단미가 제공하는 심리 독립 테스트 및 관련 서비스 이용에 관한 조건을 규정합니다.</p>
            <p style={{ marginBottom: '9px' }}><strong style={{ color: 'rgba(255,255,255,0.78)' }}>제2조 서비스의 성격</strong><br />본 서비스는 자기계발 목적 콘텐츠로, 전문 심리상담·의료 진단·치료 행위가 아닙니다.</p>
            <p style={{ marginBottom: '9px' }}><strong style={{ color: 'rgba(255,255,255,0.78)' }}>제3조 저작권</strong><br />모든 콘텐츠의 저작권은 라온단미에 귀속됩니다. 무단 복제·배포·판매를 금지합니다.</p>
            <p style={{ marginBottom: '9px' }}><strong style={{ color: 'rgba(255,255,255,0.78)' }}>제4조 책임 제한</strong><br />회사는 서비스 이용으로 발생한 심리적·정서적 결과에 대해 법적 책임을 지지 않습니다.</p>
            <p style={{ marginBottom: '6px' }}><strong style={{ color: 'rgba(255,255,255,0.78)' }}>제5조 사업자 정보</strong></p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.42)', lineHeight: 2.0 }}>
              상호: {BIZ.name}<br />대표자: {BIZ.rep}<br />사업자번호: {BIZ.regNo}<br />통신판매업: {BIZ.saleNo}<br />주소: {BIZ.addr}<br />이메일: {BIZ.email}
            </p>
            <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.26)', marginTop: '9px' }}>시행일: 2026년 1월 1일</p>
          </Legal>
        )}

      </div>
    </div>
  );
}

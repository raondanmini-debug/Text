import {useState,useEffect,useCallback,useRef} from 'react';
import {RadarChart,PolarGrid,PolarAngleAxis,Radar,ResponsiveContainer,Tooltip} from 'recharts';
 
const SHEET_URL='https://script.google.com/macros/s/AKfycbyNPOJmdcGDCXhPCgrRsQ3Zu8WJaS-E266W0-R3t9M90-39vx21XrRVlfMDd-YtYl2d/exec';
const SITE_URL='https://text-68n.pages.dev';
const PRICE='24,900원';
 
const BIZ={name:'라온단미',rep:'최국화',regNo:'177-32-01407',saleNo:'2025-별내-0002',addr:'경기도 남양주시 두물로 11번길 40-19, 6층 (별내동, 풍전프라자)',email:'raondanmini@gmail.com'};
 
const SC={INTRO:'intro',CAREGIVER:'caregiver',P0:'p0',P1:'p1',EMAIL:'email',LOADING:'loading',RESULT:'result',PAID_LOADING:'paid_loading',PAID:'paid',PRIVACY:'privacy',REFUND:'refund',TERMS:'terms'};
 
// ── 시뮬레이션 모드 (결제 연동 전 테스트용) ──
const SIM_MODE = new URLSearchParams(window.location.search).get('mode') === 'preview';
 
const CAREGIVER_OPTS=[{id:'both',label:'부모님 두 분 모두'},{id:'mother',label:'어머니 (단독)'},{id:'father',label:'아버지 (단독)'},{id:'grandparents',label:'조부모'},{id:'relatives',label:'다른 친척'},{id:'facility',label:'시설 · 위탁가정'},{id:'independent',label:'사실상 보호자 없이 지냄'}];
 
const P0Q=['주 양육자와 함께할 때, 나는 있는 그대로의 나를 드러낼 수 있었다','가정 내 감정 표현은 전반적으로 허용되는 분위기였다','주 양육자(들)는 나의 감정이나 생각에 충분히 반응해 주었다','가정 안의 분위기는 대체로 예측 가능하고 안정적이었다','어릴 때 나에게는 스스로 결정하고 선택할 수 있는 공간이 있었다','실수하거나 기대에 못 미쳤을 때, 수용보다는 비판이나 실망을 경험했다','가정 내에서 어른들의 감정이나 문제를 내가 해결해야 한다는 압박이 있었다'];
 
const DIMS=[
  {id:'d1',name:'방어기제',color:'#CE93D8',qs:['힘든 일이 생기면 감정보다 원인 분석에 먼저 집중하고, 감정은 나중에 처리하는 편이다','상처받은 것을 당시에는 몰랐다가, 한참 후에야 그때 많이 힘들었구나 라고 깨닫는 경우가 있다','감당하기 어려운 상황이 오면 관련된 것을 일단 멀리하거나 다른 것에 집중하는 방식으로 대처한다','속으로는 불안하거나 힘들어도, 주변에는 괜찮은 것처럼 보이게 행동하는 것이 익숙하다','극도로 스트레스받는 상황에서 그 상황이 현실처럼 느껴지지 않거나 나를 외부에서 바라보는 것 같은 느낌이 든 적이 있다','매우 힘든 시기를 겪었는데도 당시에는 별로 힘들지 않았고, 한참 뒤에야 그 무게를 느낀 경험이 있다']},
  {id:'d2',name:'애착유형',color:'#F48FB1',qs:['가까운 관계에서 상대방의 반응이 없거나 늦으면, 나에게 문제가 생긴 건 아닌지 불안해진다','관계가 깊어질수록 상대방이 진짜 나를 알게 될까봐 두렵거나 불편한 느낌이 든다','나를 아끼고 잘 대해주는 사람에게 오히려 어색함이나 불신이 생기는 경우가 있다','관계에서 갈등이 생기면 그 관계 자체가 끝나버릴 것 같은 강한 불안감을 느낀다','친밀한 관계가 형성되기 직전, 이유를 설명하기 어려운 거리감이나 회피 충동을 경험한 적이 있다','정서적으로 나를 필요로 하는 사람에게는 잘 반응하지만, 정작 내가 필요할 때 도움을 요청하는 것은 어렵다']},
  {id:'d3',name:'인지왜곡',color:'#80DEEA',qs:['한 번 실패하거나 거절당하면 나는 원래 이런 사람이야 라는 결론으로 이어지는 경향이 있다','칭찬이나 긍정적 피드백을 받아도 우연이다 저 사람이 모르는 것이다 라고 생각하며 무효화하는 편이다','어떤 일이 잘못될 가능성이 있으면 최악의 시나리오가 자동으로 먼저 떠오른다','상대방의 표정이나 행동을 보고 분명히 나를 좋아하지 않을 것이다 라고 확신하는 경향이 있다','일을 할 때 완벽하지 않으면 아예 하지 않은 것과 같다는 생각이 든다','좋았던 일보다 잘못된 일이 더 오래 더 강하게 기억에 남는다']},
  {id:'d4',name:'회복탄력성',color:'#A5D6A7',positive:true,qs:['예상치 못한 어려움이 생겼을 때, 어느 정도 시간이 지나면 다시 일상으로 돌아올 수 있다','실패나 좌절 이후에도 다음엔 어떻게 할까 를 생각하는 쪽으로 전환되는 편이다','감정이 격해지는 상황에서도 결정적인 행동 전에 잠깐 멈출 수 있다','힘든 시기가 있어도 영원히 이럴 것이다 보다 이것도 지나간다 는 관점이 드는 편이다','내가 통제할 수 없는 일과 할 수 있는 일을 어느 정도 구분하는 편이다']},
  {id:'d5',name:'신체신호',color:'#FFAB91',qs:['특정 사람과의 연락이나 대화 전후에 두통, 피로감, 소화 불편 같은 신체 반응이 나타나는 경우가 있다','스트레스를 받는 상황에서 가슴이 답답하거나, 목이 조이는 느낌, 얕은 호흡 같은 신체 반응이 먼저 오는 편이다','누군가 나에게 불만이 있을 것 같다는 생각이 들면 마음속에서 쉽게 털어내기가 어렵다','비판이나 지적을 받으면 그 내용과 무관하게 감정적 반응이 즉각적으로 강하게 온다','관계에서 상처받은 감정이 오래 남아, 원할 때 놓아버리기가 어렵다']},
  {id:'d6',name:'과도한통제',color:'#FFD54F',qs:['내가 직접 하면 더 잘 될 것 같아서 다른 사람에게 맡기는 것이 불편하다','모든 것을 파악하고 있어야 안심이 되며, 예측 불가능한 변수가 생기면 즉각적으로 불안이 올라온다','쉬고 있을 때 지금 뭔가 하고 있어야 한다 는 생각이 들거나 아무것도 안 하는 것에 죄책감을 느낀다','내가 나서지 않으면 일이 잘못될 것 같아서, 사실 내가 안 해도 되는 일까지 맡게 되는 경우가 많다','완벽하게 준비되지 않았다는 이유로 시작을 미루는 패턴이 반복된다','타인에게 도움을 받거나 의지하는 것이 불편하게 느껴진다']},
  {id:'d7',name:'자책죄책감',color:'#EF9A9A',qs:['실수를 했을 때 내가 뭔가 잘못한 것이 아니라 내가 나쁜 사람이다 는 느낌이 든다','타인에게 약한 모습이나 어려움을 드러내는 것이 매우 불편하거나 두렵다','비판을 받을 때 행동에 대한 피드백으로 받아들이기보다 나 자신이 거부당하는 느낌을 받는다','가족 중 누군가가 힘들어 보이면 내가 더 잘했어야 했다는 생각이 자동으로 올라온다','내 필요나 욕구를 채우는 것이 이기적인 것 같아 망설여질 때가 있다','가족의 기대에 부응하지 못했다고 느낄 때, 심한 자책이나 무력감이 동반된다']},
  {id:'d8',name:'감정인식',color:'#B3E5FC',positive:true,reverseDisplay:true,qs:['내 감정이 어떤 것인지 명확하게 말로 표현하기 어려울 때가 많다','기분이 안 좋다는 것은 알지만 그것이 슬픔인지, 분노인지, 불안인지 구분이 잘 안 된다','감정적으로 힘든 상황에서 감정보다 신체 증상이 먼저 나타나는 편이다','대화에서 상대방의 감정 상태를 감지하는 것보다 내 감정 상태를 파악하는 것이 더 어렵다','어떤 감정인지 알기 전에 이미 특정 행동을 하고 나서, 나중에 왜 그렇게 했지 를 생각하는 경우가 있다']},
  {id:'d9',name:'자기자비',color:'#F8BBD0',positive:true,reverseDisplay:true,qs:['실수했을 때 다른 사람에게는 괜찮다고 할 상황인데 나 자신에게는 유독 가혹하게 대한다','힘든 순간에 나 자신에게 따뜻하게 대하는 것이 어색하거나 불필요하게 느껴진다','내가 겪는 어려움이 많은 사람들이 경험하는 보편적인 것이라기보다 특별히 나에게만 일어나는 일처럼 느껴진다','괴로운 생각이나 감정이 떠오를 때, 그것을 객관적으로 바라보기보다 그 감정에 완전히 압도되는 경향이 있다','나 자신을 돌보는 것에 시간을 쓰면 왠지 허용되지 않는 것 같은 느낌이 든다']},
  {id:'d10',name:'심리적유연성',color:'#DCEDC8',positive:true,reverseDisplay:true,qs:['불편한 생각이나 감정이 생기면 그것에서 빨리 벗어나거나 없애려고 노력하는 편이다','내 생각이나 믿음이 사실이 아닐 수도 있다는 것을 받아들이는 것이 어렵다','지금 이 순간에 집중하기보다 과거에 대한 반추나 미래에 대한 걱정이 더 많이 나타난다','내가 중요하게 생각하는 것과 실제로 하는 행동 사이에 괴리감을 자주 느낀다','상황이 달라져도 내 방식을 바꾸기가 어렵거나, 새로운 접근을 시도하는 것이 불편하다']},
];
 
const OPTS=[{l:'전혀 아니다',v:1},{l:'아니다',v:2},{l:'가끔 그렇다',v:3},{l:'종종 그렇다',v:4},{l:'항상 그렇다',v:5}];
const P0_OPTS=[{l:'전혀 아니다',v:1},{l:'아니다',v:2},{l:'보통이다',v:3},{l:'그렇다',v:4},{l:'매우 그렇다',v:5}];
 
const CHECKLIST=['화가 나도 나중에 혼자 삭히는 편이다','가족이 힘들어 보이면 왠지 내 탓인 것 같다','잘 대해주는 사람보다 나를 힘들게 하는 사람에게 더 오래 마음이 간다','충분히 잘하는데도 늘 부족한 느낌이 든다','실수했을 때 행동이 아닌 내 자체가 나쁜 것 같은 느낌이 든다','다 내가 해야 안심이 된다. 맡기면 불안하다','가까워질수록 불편하거나, 반대로 떠날까봐 불안하다','열심히 살고 있는데 왜 이렇게 공허한지 모르겠다','분명히 피곤한데 멈추면 안 될 것 같다','나를 위한 선택을 하면 뭔가 허용되지 않는 느낌이 든다','내가 느끼는 감정이 정확히 뭔지 말하기 어려울 때가 있다','잘 되고 있는 것보다 잘못된 것이 더 오래 머릿속에 남는다'];
 
const MID_MSGS={10:{title:'잘 하고 있어요',body:'지금 솔직하게 답하는 것 자체가 이미 시작이에요.'},21:{title:'절반을 넘었어요',body:'이 응답들이 쌓여 당신만의 패턴 지도가 만들어지고 있어요.'},35:{title:'거의 다 왔어요',body:'지금 이 질문들에 솔직하게 답하는 것 자체가 변화의 시작이에요.'},50:{title:'마지막 구간이에요',body:'12분의 솔직함이 수년간의 패턴을 처음으로 언어로 만들어줄 거예요.'}};
 
// ── 175패턴 테이블 ──
const PATTERN_TABLE={
'D1':{name:'뒤늦게 감정을 여는 관찰자',sub:'감정이 오기까지 시간이 걸려요. 이미 지나간 뒤에야 알아요.'},
'D10':{name:'익숙한 방식을 지키는 수호자',sub:'바꾸고 싶은데 바꾸는 게 불편해요.'},
'D2':{name:'가까울수록 불안해지는 연결자',sub:'연결을 원하는데 연결이 두려워요.'},
'D3':{name:'최악부터 계산하는 분석가',sub:'생각이 나를 향해 조용히, 꾸준히 작동해요.'},
'D4':{name:'흔들려도 돌아오는 회복자',sub:'흔들려도 돌아와요. 그게 당신이에요.'},
'D5':{name:'몸이 먼저 말하는 감지자',sub:'마음이 말 못 할 때 몸이 먼저 알아요.'},
'D6':{name:'모든 걸 잡고 있어야 하는 관리자',sub:'다 잡고 있어야 안심이 돼요. 근데 지쳐요.'},
'D7':{name:'항상 내 탓을 먼저 찾는 자책자',sub:'잘못이 없는데 내 탓이에요.'},
'D8':{name:'자신의 감정이 낯선 탐험가',sub:'내가 지금 뭘 느끼는지 잘 모르겠어요.'},
'D9':{name:'자신에게만 가장 엄격한 판사',sub:'남에게는 관대한데 나에게는 달라요.'},
'D1+D10':{name:'굳어가는 수호자',sub:'방어하는 방식도 바꾸기 어려워요.'},
'D1+D2':{name:'불안한 관찰자',sub:'감정을 나중으로 미루는데 관계에서는 불안해요.'},
'D1+D3':{name:'냉정한 분석가',sub:'상처도 이유를 찾아야 인정해요.'},
'D1+D4':{name:'고독한 전사',sub:'잘 이겨내는데 어떻게 이겨냈는지 잘 몰라요.'},
'D1+D5':{name:'침묵하는 감지자',sub:'감정은 미루는데 몸은 이미 알고 있어요.'},
'D1+D6':{name:'철벽 관리자',sub:'감정도 통제의 대상이에요.'},
'D1+D7':{name:'조용한 자책자',sub:'힘들었던 걸 나중에야 알고, 그때 내 탓해요.'},
'D1+D8':{name:'무감각한 탐험가',sub:'감정이 오는 것도 느린데, 뭔지도 몰라요.'},
'D1+D9':{name:'냉정한 판사',sub:'감정을 거리두고 보는데 나에게는 엄격해요.'},
'D2+D10':{name:'경직된 연결자',sub:'연결하는 방식이 하나밖에 없어요.'},
'D2+D3':{name:'예민한 연결자',sub:'최악을 확신하며 관계에서 불안해요.'},
'D2+D4':{name:'흔들리는 전사',sub:'회복은 잘 하는데 관계에서 흔들려요.'},
'D2+D5':{name:'떨리는 연결자',sub:'관계 불안이 몸으로 반응해요.'},
'D2+D6':{name:'집착하는 관리자',sub:'떠날까봐 두려워서 더 잡으려 해요.'},
'D2+D7':{name:'불안한 자책자',sub:'관계가 어려울 때마다 내 탓이에요.'},
'D2+D8':{name:'당황한 연결자',sub:'관계가 불안한데 왜 그런지 말로 못 해요.'},
'D2+D9':{name:'연약한 연결자',sub:'연결을 원하는데 나는 받을 자격이 없는 것 같아요.'},
'D3+D10':{name:'경직된 분석가',sub:'보는 방식도, 바꾸는 것도 어려워요.'},
'D3+D4':{name:'강인한 분석가',sub:'잘 이겨내는데 상황을 부정적으로 읽어요.'},
'D3+D5':{name:'예민한 감지자',sub:'몸과 마음이 동시에 신호를 잘못 읽어요.'},
'D3+D6':{name:'엄격한 관리자',sub:'완벽하게 통제하고 싶은데 생각도 왜곡돼요.'},
'D3+D7':{name:'자동 자책자',sub:'생각이 시작되면 결론은 항상 내 탓이에요.'},
'D3+D8':{name:'길 잃은 탐험가',sub:'생각도 왜곡되고 감정도 잘 몰라요.'},
'D3+D9':{name:'가혹한 판사',sub:'왜곡된 기준으로 나를 심판해요.'},
'D4+D10':{name:'단단한 수호자',sub:'강한데 방식을 바꾸기 어려워요.'},
'D4+D5':{name:'강인한 감지자',sub:'몸이 신호를 보내도 이겨내요. 계속.'},
'D4+D6':{name:'완벽한 전사',sub:'잘 이겨내는데 통제해야 안심이 돼요.'},
'D4+D7':{name:'공허한 전사',sub:'이겨낸 다음에 내 탓이 시작돼요.'},
'D4+D8':{name:'고독한 탐험가',sub:'잘 버티는데 내가 어떤지 잘 몰라요.'},
'D4+D9':{name:'지치는 전사',sub:'이겨내도 충분하지 않은 것 같아요.'},
'D5+D10':{name:'굳어가는 감지자',sub:'방식도 몸도 굳어 있어요.'},
'D5+D6':{name:'긴장한 관리자',sub:'통제하려 할수록 몸이 먼저 반응해요.'},
'D5+D7':{name:'묵직한 자책자',sub:'몸이 죄책감을 대신 짊어져요.'},
'D5+D8':{name:'고통받는 감지자',sub:'몸은 아는데 감정으로 표현이 안 돼요.'},
'D5+D9':{name:'아픈 판사',sub:'몸이 보내는 신호도 가혹하게 읽혀요.'},
'D6+D10':{name:'이중 관리자',sub:'통제와 경직이 함께 작동해요.'},
'D6+D7':{name:'완벽한 자책자',sub:'완벽하지 않으면 내 탓이에요.'},
'D6+D8':{name:'당황한 관리자',sub:'통제는 하는데 내가 왜 그러는지 몰라요.'},
'D6+D9':{name:'냉혹한 완벽주의자',sub:'완벽해야 하고 그렇지 않으면 나를 혼내요.'},
'D7+D10':{name:'경직된 자책자',sub:'자책하는 방식도 바꾸기 어려워요.'},
'D7+D8':{name:'혼란한 자책자',sub:'내 탓인데 왜 그런지 설명이 안 돼요.'},
'D7+D9':{name:'지치는 판사',sub:'스스로 자책하고 스스로 가혹해요.'},
'D8+D10':{name:'막힌 탐험가',sub:'감정도 모르고 방식도 경직돼요.'},
'D8+D9':{name:'낯선 판사',sub:'나에게 상냥한 게 어색해요. 나를 잘 모르니까요.'},
'D9+D10':{name:'단단한 판사',sub:'가혹함도 경직됐어요. 나를 대하는 방식이요.'},
'D1+D2+D10':{name:'얼어붙은 연결자',sub:'연결을 원하는데 방식이 굳어 있어요.'},
'D1+D2+D3':{name:'폭풍 같은 분석가',sub:'겉은 조용한데 안에서 불안과 왜곡이 동시예요.'},
'D1+D2+D4':{name:'외로운 연결자',sub:'회복은 하는데 감정을 미루고 관계에서 불안해요.'},
'D1+D2+D5':{name:'방어하는 연결자',sub:'몸이 먼저 알아요. 불안과 방어가 함께예요.'},
'D1+D2+D6':{name:'완전무장한 방어자',sub:'방어하면서 통제하고 그러면서도 불안해요.'},
'D1+D2+D7':{name:'조용히 무너지는 보호자',sub:'나중에 힘들었구나 알고, 그때 내 탓하며 불안해요.'},
'D1+D2+D8':{name:'이중으로 막힌 연결자',sub:'불안한데 감정을 미루고 이름도 못 붙여요.'},
'D1+D2+D9':{name:'차가운 고독자',sub:'방어하고 불안하면서 나에게 가혹해요.'},
'D1+D3+D10':{name:'굳어버린 분석가',sub:'방어하는 방식도 생각도 굳어 있어요.'},
'D1+D3+D4':{name:'냉정한 생존자',sub:'잘 버티는데 감정도 미루고 왜곡도 해요.'},
'D1+D3+D5':{name:'혼란한 분석가',sub:'생각은 왜곡되고 감정은 미루는데 몸은 알아요.'},
'D1+D3+D6':{name:'철벽 방어자',sub:'방어하고 통제하고 왜곡해요. 다 같은 방향이에요.'},
'D1+D3+D7':{name:'논리적인 자책자',sub:'왜곡된 이유로 감정을 미루다 자책해요.'},
'D1+D3+D8':{name:'깊은 안개의 탐험가',sub:'감정을 미루고 왜곡하고 이름도 못 붙여요.'},
'D1+D3+D9':{name:'차가운 판사',sub:'왜곡된 기준으로 나중에 자신을 벌해요.'},
'D1+D4+D10':{name:'굳어버린 전사',sub:'강한데 방어 방식이 굳어 있어요.'},
'D1+D4+D5':{name:'무감각한 전사',sub:'잘 버티고 방어하는데 몸이 신호를 보내요.'},
'D1+D4+D6':{name:'완전무장한 전사',sub:'강하고 통제하고 방어해요. 지치는 조합이에요.'},
'D1+D4+D7':{name:'침묵하는 자책자',sub:'잘 이겨내는데 나중에 내 탓이 시작돼요.'},
'D1+D4+D8':{name:'안개 속 전사',sub:'잘 버티는데 감정을 미루고 뭔지도 몰라요.'},
'D1+D4+D9':{name:'차가운 전사',sub:'강한데 나에게 가혹하고 감정도 미뤄요.'},
'D1+D5+D10':{name:'굳어가는 감시자',sub:'방어하고 경직됐는데 몸만 신호를 보내요.'},
'D1+D5+D6':{name:'긴장한 방어자',sub:'방어하고 통제하는데 몸이 긴장해요.'},
'D1+D5+D7':{name:'묵직한 보호자',sub:'감정을 미루면 몸이 짊어지고 나중에 자책해요.'},
'D1+D5+D8':{name:'말 없는 감지자',sub:'몸은 신호를 보내는데 감정을 미루고 이름도 몰라요.'},
'D1+D5+D9':{name:'아픈 보호자',sub:'방어하는데 몸이 아프고 나에게 가혹해요.'},
'D1+D6+D10':{name:'삼중 방어자',sub:'방어와 통제와 경직이 함께 작동해요.'},
'D1+D6+D7':{name:'가장 엄격한 관리자',sub:'방어하고 통제하고 자책해요. 자신에게 가장 엄격해요.'},
'D1+D6+D8':{name:'당황한 방어자',sub:'방어하고 통제하는데 이유를 모르겠어요.'},
'D1+D6+D9':{name:'냉혹한 방어자',sub:'방어하고 통제하고 나에게 가혹해요.'},
'D1+D7+D10':{name:'경직된 자책자',sub:'자책하는 방식이 굳어 있고 감정도 미뤄요.'},
'D1+D7+D8':{name:'혼란한 보호자',sub:'나중에 내 탓하는데 왜 그런지 설명도 안 돼요.'},
'D1+D7+D9':{name:'조용한 판사',sub:'감정을 미루다가 나에게 가장 가혹하게 자책해요.'},
'D1+D8+D10':{name:'이중 관찰자',sub:'감정을 미루고 이름 모르고 방식도 굳어요.'},
'D1+D8+D9':{name:'낯선 보호자',sub:'감정을 미루고 이름도 모르고 나에게 가혹해요.'},
'D1+D9+D10':{name:'차갑게 굳은 수호자',sub:'방어하고 가혹하고 경직된 조합이에요.'},
'D2+D3+D10':{name:'완고한 연결자',sub:'관계 불안과 왜곡이 경직된 패턴으로 굳어요.'},
'D2+D3+D4':{name:'불안한 생존자',sub:'잘 이겨내는데 관계에서 불안하고 생각도 왜곡돼요.'},
'D2+D3+D5':{name:'폭발 직전의 연결자',sub:'관계 불안이 몸으로도 생각으로도 동시에 반응해요.'},
'D2+D3+D6':{name:'완벽을 찾는 불안자',sub:'통제하고 왜곡하며 관계 불안을 감춰요.'},
'D2+D3+D7':{name:'자동 유죄 연결자',sub:'관계에서 불안하면 왜곡되고 자동으로 내 탓이에요.'},
'D2+D3+D8':{name:'길 잃은 연결자',sub:'관계가 두려운데 왜 그런지 감정으로 표현 못 해요.'},
'D2+D3+D9':{name:'가혹한 연결자',sub:'관계 불안을 왜곡된 기준으로 나에게 가혹하게 해석해요.'},
'D2+D4+D10':{name:'굳어버린 연결자',sub:'강한데 관계 방식이 굳어 있어요.'},
'D2+D4+D5':{name:'흔들리는 감지자',sub:'잘 버티는데 관계에서 흔들리고 몸이 반응해요.'},
'D2+D4+D6':{name:'완벽한 연결자',sub:'강하고 통제하는데 관계에서 불안해요.'},
'D2+D4+D7':{name:'이겨내는 자책자',sub:'잘 이겨내는데 관계 불안에 자책이 더해져요.'},
'D2+D4+D8':{name:'강인한 연결자',sub:'잘 버티는데 관계 불안의 감정을 모르겠어요.'},
'D2+D4+D9':{name:'단단한 연결자',sub:'강한데 관계에서 불안하고 나에게 가혹해요.'},
'D2+D5+D10':{name:'굳어가는 연결자',sub:'관계 불안이 몸에 굳어 있어요.'},
'D2+D5+D6':{name:'긴장한 연결자',sub:'관계 불안이 몸으로 오고 통제로 대응해요.'},
'D2+D5+D7':{name:'아픈 연결자',sub:'관계 불안이 몸으로 오고 자책으로 이어져요.'},
'D2+D5+D8':{name:'당황한 감지자',sub:'몸이 떨리는데 그게 뭔지 설명이 안 돼요.'},
'D2+D5+D9':{name:'상처받은 연결자',sub:'관계 불안이 몸의 통증과 자책으로 이어져요.'},
'D2+D6+D10':{name:'완고한 관리자',sub:'관계 방식이 경직되고 통제로 굳어요.'},
'D2+D6+D7':{name:'지치는 관리자',sub:'통제하고 자책하며 관계 불안을 감당해요.'},
'D2+D6+D8':{name:'혼란한 관리자',sub:'통제하고 집착하는데 이유를 모르겠어요.'},
'D2+D6+D9':{name:'냉혹한 연결자',sub:'통제하고 집착하고 나에게 가혹해요.'},
'D2+D7+D10':{name:'완고한 자책자',sub:'관계 불안에 자책이 굳은 패턴으로 작동해요.'},
'D2+D7+D8':{name:'혼란한 연결자',sub:'관계에서 자책하는데 이유를 감정으로 표현 못 해요.'},
'D2+D7+D9':{name:'지치는 연결자',sub:'관계에서 불안하고 자책하고 나에게 가혹해요.'},
'D2+D8+D10':{name:'삼중으로 막힌 연결자',sub:'관계 불안의 감정도 모르고 방식도 굳어요.'},
'D2+D8+D9':{name:'낯선 연결자',sub:'관계가 불안한데 감정도 모르고 나에게 가혹해요.'},
'D2+D9+D10':{name:'고통받는 연결자',sub:'관계 불안에 가혹함과 경직이 더해져요.'},
'D3+D4+D10':{name:'완고한 전사',sub:'강한데 생각도 방식도 굳어요.'},
'D3+D4+D5':{name:'폭발하는 분석가',sub:'잘 버티는데 생각이 왜곡되고 몸이 반응해요.'},
'D3+D4+D6':{name:'완벽한 분석가',sub:'강하고 통제하는데 생각이 왜곡돼요.'},
'D3+D4+D7':{name:'분석적 자책자',sub:'잘 이겨내는데 왜곡된 생각이 자책으로 이어져요.'},
'D3+D4+D8':{name:'안개 속 분석가',sub:'잘 버티는데 생각도 왜곡되고 감정도 몰라요.'},
'D3+D4+D9':{name:'철저한 판사',sub:'강한데 왜곡된 기준으로 나를 심판해요.'},
'D3+D5+D10':{name:'완고한 감지자',sub:'왜곡과 신체반응이 경직된 패턴으로 굳어요.'},
'D3+D5+D6':{name:'예민한 관리자',sub:'왜곡된 생각이 몸으로, 통제로 나타나요.'},
'D3+D5+D7':{name:'고통받는 자책자',sub:'왜곡된 죄책감이 몸에 쌓여요.'},
'D3+D5+D8':{name:'혼란한 감지자',sub:'생각이 왜곡되고 몸이 반응하는데 감정은 몰라요.'},
'D3+D5+D9':{name:'아픈 분석가',sub:'왜곡된 기준이 몸의 통증과 가혹함으로 나타나요.'},
'D3+D6+D10':{name:'완전무장한 관리자',sub:'왜곡과 통제와 경직이 하나의 패턴이에요.'},
'D3+D6+D7':{name:'가장 가혹한 완벽주의자',sub:'왜곡하고 통제하고 자책해요. 항상 나쁜 건 나예요.'},
'D3+D6+D8':{name:'당황한 분석가',sub:'왜곡하고 통제하는데 내 감정은 몰라요.'},
'D3+D6+D9':{name:'가혹한 완벽주의자',sub:'왜곡된 기준으로 통제하고 나에게 가혹해요.'},
'D3+D7+D10':{name:'경직된 유죄자',sub:'왜곡과 자책이 경직된 패턴으로 작동해요.'},
'D3+D7+D8':{name:'눈 먼 자책자',sub:'왜곡되면 자책이 시작되는데 감정도 몰라요.'},
'D3+D7+D9':{name:'합리적 판사',sub:'왜곡된 이유로 자책하고 나에게 가혹해요.'},
'D3+D8+D10':{name:'삼중 안개의 탐험가',sub:'왜곡과 감정 모름과 경직이 함께예요.'},
'D3+D8+D9':{name:'이중으로 막힌 판사',sub:'생각도 왜곡되고 감정도 모르고 나에게 가혹해요.'},
'D3+D9+D10':{name:'완고한 판사',sub:'왜곡된 기준이 경직되고 가혹하게 작동해요.'},
'D4+D5+D10':{name:'굳어가는 전사',sub:'강하고 몸이 신호를 보내는데 방식이 굳어요.'},
'D4+D5+D6':{name:'강인한 관리자',sub:'강하고 통제하는데 몸이 긴장해요.'},
'D4+D5+D7':{name:'고통받는 전사',sub:'잘 이겨내는데 몸이 신호를 보내고 자책이 와요.'},
'D4+D5+D8':{name:'무감각한 감지자',sub:'잘 버티는데 몸이 신호를 보내고 감정은 몰라요.'},
'D4+D5+D9':{name:'아픈 전사',sub:'강한데 몸이 아프고 나에게 가혹해요.'},
'D4+D6+D10':{name:'단단한 관리자',sub:'강하고 통제하는데 방식이 굳어요.'},
'D4+D6+D7':{name:'이겨내는 완벽주의자',sub:'잘 이겨내는데 통제하고 자책해요.'},
'D4+D6+D8':{name:'완벽한 관리자',sub:'강하고 통제하는데 내 감정은 몰라요.'},
'D4+D6+D9':{name:'냉혹한 전사',sub:'강하고 통제하는데 나에게 가혹해요.'},
'D4+D7+D10':{name:'굳어가는 자책자',sub:'잘 이겨내는데 자책하고 방식이 굳어요.'},
'D4+D7+D8':{name:'공허한 탐험가',sub:'잘 이겨내는데 자책하고 감정도 몰라요.'},
'D4+D7+D9':{name:'가장 지치는 전사',sub:'잘 이겨내는데 자책하고 나에게 가혹해요.'},
'D4+D8+D10':{name:'단단한 탐험가',sub:'강한데 감정도 모르고 방식도 굳어요.'},
'D4+D8+D9':{name:'고독한 판사',sub:'강한데 감정도 모르고 나에게 가혹해요.'},
'D4+D9+D10':{name:'굳어가는 판사',sub:'강한데 가혹하고 경직돼요.'},
'D5+D6+D10':{name:'삼중으로 굳은 관리자',sub:'통제와 경직과 신체긴장이 함께예요.'},
'D5+D6+D7':{name:'고통받는 관리자',sub:'통제하고 자책하는 것이 몸에 쌓여요.'},
'D5+D6+D8':{name:'혼란한 관리자',sub:'통제하고 몸이 긴장하는데 감정은 몰라요.'},
'D5+D6+D9':{name:'아픈 관리자',sub:'통제하는데 몸이 아프고 나에게 가혹해요.'},
'D5+D7+D10':{name:'굳어있는 자책자',sub:'자책과 신체신호와 경직이 함께예요.'},
'D5+D7+D8':{name:'눈 먼 감지자',sub:'몸이 죄책감을 짊어지는데 감정 이름도 몰라요.'},
'D5+D7+D9':{name:'지치는 감지자',sub:'자책이 몸에 쌓이고 나에게 가혹해요.'},
'D5+D8+D10':{name:'이중으로 굳은 감지자',sub:'신체신호와 감정 모름과 경직이 함께예요.'},
'D5+D8+D9':{name:'아픈 탐험가',sub:'몸이 신호를 보내는데 감정도 모르고 나에게 가혹해요.'},
'D5+D9+D10':{name:'삼중으로 지치는 감지자',sub:'몸이 아프고 가혹하고 경직돼요.'},
'D6+D7+D10':{name:'삼중으로 굳은 완벽주의자',sub:'통제와 자책과 경직이 함께 작동해요.'},
'D6+D7+D8':{name:'당황한 완벽주의자',sub:'통제하고 자책하는데 이유를 감정으로 표현 못 해요.'},
'D6+D7+D9':{name:'가장 지치는 완벽주의자',sub:'통제하고 자책하고 나에게 가혹해요. 가장 힘든 조합이에요.'},
'D6+D8+D10':{name:'삼중 관리자',sub:'통제와 감정 모름과 경직이 함께예요.'},
'D6+D8+D9':{name:'낯선 완벽주의자',sub:'통제하고 가혹한데 내 감정은 몰라요.'},
'D6+D9+D10':{name:'삼중 감옥의 완벽주의자',sub:'통제와 가혹함과 경직이 함께예요.'},
'D7+D8+D10':{name:'이중으로 굳은 자책자',sub:'자책과 감정 모름과 경직이 함께예요.'},
'D7+D8+D9':{name:'가장 지치는 판사',sub:'자책하고 가혹한데 왜 그런지도 몰라요.'},
'D7+D9+D10':{name:'삼중으로 지치는 판사',sub:'자책과 가혹함과 경직이 함께예요.'},
'D8+D9+D10':{name:'자신과 가장 멀어진 탐험가',sub:'감정도 모르고 가혹하고 경직됐어요. 자신과 가장 멀어요.'},
};
 
function lookupPattern(dimScores) {
  const RISK=['d1','d2','d3','d5','d6','d7'];
  const RES=['d4','d8','d9','d10'];
  const R={};
  dimScores.forEach(d=>{R[d.id]=getDisplayScore(d)/d.max;});
  const h=id=>RISK.includes(id)&&R[id]>=0.45;
  const rH=id=>RES.includes(id)&&R[id]>=0.65;
 
  // 상위 활성 지표 추출 (최대 3개)
  const activeRisk=RISK.filter(h).sort((a,b)=>R[b]-R[a]);
  const activeRes=RES.filter(rH).sort((a,b)=>R[b]-R[a]);
  const all=[...activeRisk,...activeRes].slice(0,3);
 
  // 테이블 조회 함수
  const lookup=ids=>{
    const key=ids.map(id=>'D'+id.slice(1).toUpperCase()).sort().join('+');
    return PATTERN_TABLE[key];
  };
 
  // 3개 → 2개 → 1개 순으로 조회
  if(all.length>=3){const p=lookup(all.slice(0,3));if(p)return p;}
  if(all.length>=2){const p=lookup(all.slice(0,2));if(p)return p;}
  if(all.length>=1){const p=lookup([all[0]]);if(p)return p;}
 
  // 자원만 있는 경우
  if(activeRes.length>0){const p=lookup([activeRes[0]]);if(p)return p;}
 
  return {name:'균형 속에서 성장하는 사람',sub:'특정 패턴이 두드러지지 않고 전반적으로 안정된 구조예요.'};
}
 
// ── 핵심 유틸 ──
function getDisplayScore(d){return d.reverseDisplay?d.max-d.score:d.score;}
 
function getLev(s,max,pos){
  const r=s/max;
  if(pos){if(r>=0.75)return{label:'높음',color:'#66BB6A'};if(r>=0.5)return{label:'보통',color:'#FFA726'};return{label:'낮음',color:'#EF5350'};}
  if(r<=0.3)return{label:'낮음',color:'#66BB6A'};if(r<=0.55)return{label:'보통',color:'#FFA726'};if(r<=0.75)return{label:'높음',color:'#FF7043'};return{label:'매우 높음',color:'#EF5350'};
}
 
function calcScores(ans){
  const ds=DIMS.map(d=>{const score=d.qs.reduce((s,_,i)=>s+(ans[d.id+'_'+i]||0),0);return{...d,score,max:d.qs.length*5};});
  return{dimScores:ds,total:ds.reduce((s,d)=>s+d.score,0)};
}
 
function getType(t){
  const max=DIMS.reduce((s,d)=>s+d.qs.length*5,0),r=t/max;
  if(r<=0.45)return{type:'초록불',color:'#66BB6A',bg:'rgba(46,125,50,0.12)',border:'#388E3C',symbol:'●',detail:'심리 독립 준비형'};
  if(r<=0.65)return{type:'노란불',color:'#FFA726',bg:'rgba(230,81,0,0.12)',border:'#E65100',symbol:'◐',detail:'경계선 회복형'};
  return{type:'빨간불',color:'#EF5350',bg:'rgba(183,28,28,0.12)',border:'#B71C1C',symbol:'▲',detail:'자아 재건형'};
}
 
function buildAnalysisData(scores,p0,care,nick,ckdArr=[]){
  const RISK_IDS=['d1','d2','d3','d5','d6','d7'];
  const RES_IDS=['d4','d8','d9','d10'];
  const dimLevels=scores.dimScores.map(d=>{
    const ds=getDisplayScore(d);const r=ds/d.max;
    let lev;if(d.positive)lev=r>=0.75?'높음':r>=0.5?'보통':'낮음';
    else lev=r<=0.3?'낮음':r<=0.55?'보통':r<=0.75?'높음':'매우 높음';
    return{name:d.name,lev,positive:d.positive,ratio:r,id:d.id};
  });
  const p0stable=['p0_0','p0_1','p0_2','p0_3','p0_4'].reduce((s,k)=>s+(p0[k]||0),0)/25;
  const p0pressure=((p0['p0_5']||0)+(p0['p0_6']||0))/10;
  const p0env=p0stable>=0.7?'안정적':p0stable>=0.4?'보통':'불안정';
  const p0press=p0pressure>=0.7?'높음':p0pressure>=0.4?'보통':'낮음';
  const highRisk=dimLevels.filter(d=>!d.positive&&(d.lev==='높음'||d.lev==='매우 높음')).map(d=>d.name);
  const lowRes=dimLevels.filter(d=>d.positive&&d.lev==='낮음').map(d=>d.name);
  const highRes=dimLevels.filter(d=>d.positive&&d.lev==='높음').map(d=>d.name);
  const allLev=dimLevels.map(d=>`${d.name}:${d.lev}`).join(', ');
  const ti=getType(scores.total);
  const ptn=lookupPattern(scores.dimScores);
  const paradox=(highRes.length>0&&highRisk.length>0)
    ?`${highRes[0]}이 높은데(자원) ${highRisk[0]}도 높다(위험) — 이 역설에서 분석 핵심을 찾아라`
    :highRes.length>0?`${highRes.join(', ')} 자원이 있음에도 삶이 가벼워지지 않는 이유가 있다`
    :'대부분 패턴이 보통 수준 — 특정 패턴만 활성화된 정밀한 구조';
  return{nick:nick||'당신',type:ti.type+' '+ti.detail,p0env,p0press,caregivers:care.join(',')||'미입력',highRisk:highRisk.join(', ')||'없음',lowRes:lowRes.join(', ')||'없음',highRes:highRes.join(', ')||'없음',allLev,paradox,patternName:ptn.name,patternSub:ptn.sub,ptn,introChecklist:ckdArr||[]};
}
 
async function callClaude(prompt,maxTokens=600){
  const r=await fetch('https://api.anthropic.com/v1/messages',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:maxTokens,messages:[{role:'user',content:prompt}]})});
  const d=await r.json();
  return d.content?.[0]?.text||'';
}
 
// ── 체크리스트 텍스트 맵 (0-indexed → 표시용) ──
const CK_MAP={
  0:'화가 나도 나중에 혼자 삭히는 편이다',
  1:'가족이 힘들어 보이면 왠지 내 탓인 것 같다',
  2:'잘 대해주는 사람보다 나를 힘들게 하는 사람에게 더 오래 마음이 간다',
  3:'충분히 잘하는데도 늘 부족한 느낌이 든다',
  4:'실수했을 때 행동이 아닌 내 자체가 나쁜 것 같은 느낌이 든다',
  5:'다 내가 해야 안심이 된다. 맡기면 불안하다',
  6:'가까워질수록 불편하거나, 반대로 떠날까봐 불안하다',
  7:'열심히 살고 있는데 왜 이렇게 공허한지 모르겠다',
  8:'분명히 피곤한데 멈추면 안 될 것 같다',
  9:'나를 위한 선택을 하면 뭔가 허용되지 않는 느낌이 든다',
  10:'내가 느끼는 감정이 정확히 뭔지 말하기 어려울 때가 있다',
  11:'잘 되고 있는 것보다 잘못된 것이 더 오래 머릿속에 남는다',
};
 
async function generateFreeInsight(data){
  // ckd는 0-indexed → 프롬프트에 1-indexed로 전달
  const ckdItems = (data.introChecklist||[]).map(i=>CK_MAP[i]).filter(Boolean);
  const ckdNums  = (data.introChecklist||[]).map(i=>i+1); // 1-indexed
 
  const SYSTEM=`당신은 라온단미입니다.
이 프롬프트는 무료 결과 페이지용 콘텐츠를 생성합니다.
 
핵심 원칙:
- 모든 요소는 불완전해야 합니다. 완결을 주면 안 됩니다.
- 갈증을 만드는 것이 목표입니다. 정보 제공이 목표가 아닙니다.
- 읽는 사람이 "이게 나야"를 느낀 직후 "더 보고 싶다"가 와야 합니다.
- "치유", "치료", "진단", "효과 보장" 표현 절대 금지.
- 위로, 격려, "힘드셨겠어요" 금지.
- 지표 이름, 점수, 수치 직접 언급 금지.
- 출력은 반드시 유효한 JSON 형식으로만. 마크다운, 설명, 앞뒤 텍스트 없음.`;
 
  const USER=`아래 데이터를 가진 사람의 무료 결과 페이지 콘텐츠를 생성해주세요.
 
[입력 데이터]
{
  "pattern_name": "${data.patternName}",
  "pattern_desc": "${data.patternSub}",
  "overall_type": "${data.type}",
  "indicators": {${data.allLev}},
  "P0": {"level":"${data.p0env}"},
  "caregiver": ["${data.caregivers}"],
  "intro_checklist_numbers": [${ckdNums.join(',')}],
  "intro_checklist_texts": ${JSON.stringify(ckdItems)},
  "high_risk_patterns": "${data.highRisk}",
  "paradox": "${data.paradox}"
}
 
아래 JSON 구조로 정확하게 출력해주세요.
 
{
  "A_pattern": {
    "name": "${data.patternName}",
    "desc": "${data.patternSub}",
    "type": "${data.type}",
    "reveal_text": "읽는 순간 멈추는 한 문장. 이 패턴 이름이 붙은 이유를 설명. 판단 없이. 30자 이내."
  },
 
  "B_checklist": {
    "items": ["체크한 항목 중 이 패턴과 가장 강하게 연결된 3개를 원문 그대로 (없으면 빈 배열)"],
    "connection": "이 X가지가 연결되어 있어요. [왜 연결되어 있는지 한 줄 암시. 답은 주지 않음.] 25자 이내.",
    "tease": "그 연결의 뿌리가 어디인지 — 전체 분석에서 처음으로 보게 돼요."
  },
 
  "C_scene": {
    "setup": "실제로 일어날 법한 구체적 상황 한 줄. 가장 높은 위험 지표 2개의 조합에서 도출.",
    "reaction": "이 패턴이 작동할 때 이 사람의 자동반응. 행동이나 생각으로. 한 줄.",
    "cutoff": "그 순간 이 사람의 내면에서 드는 말. 한 줄. 읽는 순간 소름이 오도록.",
    "question": "이 반응이 왜 자동으로 나오는지 알고 싶으신가요?"
  },
 
  "D_blur": {
    "visible": "님은",
    "blurred": "이 사람의 핵심 구조를 정확하게 짚는 10~15자. 읽으면 멈추는 문장의 핵심 부분.",
    "visible_end": "인 사람이에요.",
    "below": "그리고 그 이유가 — 생각보다 훨씬 오래됐어요."
  },
 
  "E_discovery": {
    "title": "발견 제목. 이 패턴 조합에서만 나오는 역설. 일반화 금지. 20자 이내.",
    "tease": "이 역설이 왜 만들어졌는지, 어떻게 작동하는지 — 전체 분석 섹션 4에서 처음으로 확인하게 됩니다.",
    "locked_count": 2
  },
 
  "F_future": {
    "year_3": "바꾸지 않을 때 3년 후. 가장 가까운 관계에서 일어날 구체적 장면 한 줄. 공포가 아닌 논리적 결과.",
    "tease": "5년 후, 10년 후 — 그리고 바꿀 때 어떻게 달라지는지도 있어요.",
    "hope_hint": "바꿀 때의 궤적이 존재한다는 것만 암시. 내용은 주지 않음."
  },
 
  "G_cta": {
    "button_text": "왜 이러는지 처음으로 알기",
    "sub_text": "패턴의 뿌리부터 10년 후 궤적까지. 오늘 처음으로 전체를 보게 됩니다."
  }
}
 
생성 원칙:
A: reveal_text만 새로 생성. name/desc/type은 입력 데이터 그대로.
B: intro_checklist_texts에서 이 패턴과 연결도 높은 3개 선택. 없으면 빈 배열.
C: 가장 높은 위험 지표 2개 조합에서 도출. 완결 금지. question으로 끊음.
D: blurred는 이 사람만의 구조. 일반적 묘사 금지.
E: 발견 제목은 이 지표 조합에서만 나오는 역설.
F: 3년 후는 논리적 결과. 극단적 공포 금지. 희망의 존재만 암시.
G: button_text는 "왜 이러는지 처음으로 알기" 고정.`;
 
  const r=await fetch('https://api.anthropic.com/v1/messages',{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      model:'claude-sonnet-4-6',
      max_tokens:1200,
      system:SYSTEM,
      messages:[{role:'user',content:USER}]
    })
  });
  const d=await r.json();
  const text=d.content?.[0]?.text||'';
  try{const clean=text.replace(/```json[\s\S]*?```|```/g,'').trim();return JSON.parse(clean);}
  catch{console.error('Free insight parse fail:',text.slice(0,200));return null;}
}
 
// ── v3 섹션별 프롬프트 설계 기반 유료 결과 생성 ──
// STAGE1: S1 → STAGE2: S2 → STAGE3: S3+S4+S5+S6 병렬 → STAGE4: S7 → STAGE5: S8
 
const PAID_SYSTEM=`당신은 라온단미입니다. 10년 이상 심리 패턴을 연구한 사람이에요.
이 리포트는 전문 심리상담이 아닌 자기계발 목적 콘텐츠입니다.
 
출력 형식 절대 원칙:
- 마크다운 기호 완전 금지. #, ##, ###, **, *, --, ---, >, 코드블록기호 절대 사용 금지.
- 제목이 필요하면 줄바꿈과 빈 줄로만 구분하세요.
- 강조가 필요하면 따옴표나 문장 구조로 강조하세요.
- 기호 없이 오직 문장으로만 작성하세요.
 
내용 원칙:
"치유", "치료", "진단", "효과 보장" 표현 절대 금지.
지표 이름(방어기제, 애착유형 등)과 점수 직접 언급 금지.
"보통 이런 유형은~" 일반화 금지.
위로가 아닌 인식. 따뜻하지만 정확하게.`;
 
async function callSection(userPrompt, maxTokens=2500, retries=2){
  for(let i=0;i<=retries;i++){
    try{
      const r=await fetch('https://api.anthropic.com/v1/messages',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({model:'claude-sonnet-4-6',max_tokens:maxTokens,system:PAID_SYSTEM,messages:[{role:'user',content:userPrompt}]})
      });
      const d=await r.json();
      // API 에러 응답 명시적 처리 (rate limit, overload 등)
      if(d.error){console.warn('API 에러:',d.error.type,d.error.message);if(i<retries){await new Promise(r=>setTimeout(r,2000*(i+1)));continue;}return null;}
      const text=d.content?.[0]?.text||'';
      if(text&&text.length>120)return text;
      console.warn(`섹션 응답 부족(${text.length}자) 재시도 ${i+1}`);
      if(i<retries)await new Promise(r=>setTimeout(r,1000));
    }catch(e){console.error('callSection 예외:',e);if(i===retries)return null;await new Promise(r=>setTimeout(r,1500));}
  }
  return null;
}
 
function buildCommonData(data){
  return `[공통 데이터]
패턴 이름: ${data.patternName}
패턴 설명: ${data.patternSub}
유형: ${data.type}
성장환경: ${data.p0env} / 비판압박: ${data.p0press} / 양육자: ${data.caregivers}
활성 위험패턴: ${data.highRisk}
약화된 자원: ${data.lowRes}
활성 자원패턴: ${data.highRes}
핵심 역설: ${data.paradox}`;
}
 
function buildS1Prompt(data){
  return `${buildCommonData(data)}
 
섹션 1을 작성해주세요.
마크다운 기호(#, ##, **, --, ---, *, >, 코드블록기호) 절대 금지. 문장으로만.
 
이 섹션의 목적: 첫 문장에서 "어떻게 알았지?"가 나오는 것.
특징 나열이 절대 아닙니다. 역설 선언이어야 합니다.
 
구성 4요소 (각 요소 최소 2문장):
 
첫째. 패턴 이름 선언
패턴 이름을 그대로 쓰되, 왜 이 이름인지 역설적 이유를 한 문장으로 붙이세요.
"이 이름이 붙은 이유는 당신이 [예상 외의 이유]이기 때문이에요" 방향.
 
둘째. 핵심 한 문장 (가장 중요. 이 섹션의 전부)
형식: "${data.nick||'당신'}님은 [핵심 구조]인 사람이에요."
이 문장은 반드시 역설이어야 합니다.
 
좋은 예 방향:
"단미님은 가장 강하기 때문에 가장 오래 지쳐있는 사람이에요."
"단미님은 아무것도 잃지 않으려고 애쓰다가, 정작 자신을 잃어가는 사람이에요."
"단미님은 누구보다 잘 해내기 때문에, 아무도 단미님이 힘들다는 걸 모르는 사람이에요."
 
나쁜 예 (절대 금지):
"단미님은 통제하려는 성향이 있는 사람이에요." — 특징 나열이라 훅이 없음.
"단미님은 자책을 많이 하는 사람이에요." — 정보 전달이라 소름이 없음.
 
이 문장을 아래 마커로 감싸주세요:
===S1START===
${data.nick||'당신'}님은 [역설적 핵심 구조]인 사람이에요.
===S1END===
 
셋째. 이 역설이 왜 만들어졌는지 2~3문장
판단 없이. 이 구조가 생긴 이유를 짧게.
 
넷째. "이 리포트는 그 구조를 처음으로 통째로 보여드립니다"로 마무리
 
금기: 위로 칭찬 격려 없음. 숫자 점수 지표 이름 금지. 일반론 금지.
마크다운 기호 절대 금지.`;
}
 
function buildS2Prompt(data, s1hl){
  const p0Branch = data.p0env==='안정적'
    ? '"아무도 요구하지 않았는데 스스로 세운 기준" 방향으로 작성'
    : data.p0env==='불안정'
    ? '"그 환경에서 생존하기 위해 자동으로 만들어진 방식" 방향으로 작성'
    : `P0 중간 + 위험패턴(${data.highRisk}) 조합으로 방향 판단:
   - 애착유형 높음 → "충분히 받았지만 조건이 있었다" 방향
   - 과도한통제 높음 → "안전을 확보하려는 자동반응" 방향
   - 자책죄책감 높음 → "충분히 잘해야 인정받는다" 방향
   - 위험지표 전반 보통 → "특정 관계/사건에서 학습된 패턴" 방향`;
 
  return `[S1_HEADLINE: ${s1hl}]
${buildCommonData(data)}
 
섹션 2를 작성해주세요. S1_HEADLINE의 방향과 톤을 유지하세요.
 
구성 4요소 (각 요소 최소 2~3문장. 마크다운 기호 없이):
 
첫째. 성장환경 한 줄 요약
P0 레벨 "${data.p0env}" 기준:
${p0Branch}
 
둘째. 그 환경이 지금의 핵심 패턴을 어떻게 만들었는지
또는 이 사람이 스스로 어떻게 만들었는지.
 
셋째. 이 패턴이 처음에는 어떤 기능을 했는지
보호, 생존, 인정받기 등 당시의 최선이었음을 인정.
 
넷째. 지금도 여전히 그 방식이 작동하고 있다는 연결
환경은 달라졌지만 패턴은 그대로인 구조.
 
금기: "트라우마" "상처" "치유" 금지. 부모 비난 금지. 지표 이름 점수 금지.
마크다운 기호 절대 금지.`;
}
 
function buildS3Prompt(data,s1hl){
  return `[S1_HEADLINE: ${s1hl}]
${buildCommonData(data)}
 
섹션 3을 작성해주세요. S1_HEADLINE의 방향과 톤을 유지하세요.
마크다운 기호(#, ##, **, --, ---, *, >, 코드블록기호) 절대 금지. 문장과 줄바꿈으로만.
 
이 섹션의 목적: "이거 완전 나잖아"가 나오는 장면 4개.
추상적 설명이 아니라 오늘 일어났을 법한 구체적 순간으로.
 
핵심 원칙: 활성 위험패턴 "${data.highRisk}"의 여러 패턴이
동시에 한 장면 안에서 작동하는 방식으로 써야 합니다.
패턴마다 따로 설명하지 말고, 하나의 구체적 순간에 동시에 나타나게.
예: 통제+자책+방어가 한 장면에서 동시에 나타나는 모습.
 
장면 구성 (마크다운 없이. 각 항목 앞에 번호나 특수기호 쓰지 말 것):
 
[장면 제목]
 
상황
구체적 상황 한 줄. 오늘 일어났을 법한 장면.
 
자동반응
이 패턴이 작동할 때 실제로 하는 행동 또는 말. 구체적으로.
 
내면의 독백
그 순간 밖에 말하지 못하는 속마음. 큰따옴표로 직접화법으로.
 
상대방이 느끼는 것
상대방 입장에서 경험하는 것. 1~2문장.
 
핵심 발견
이 장면이 보여주는 구조적 진실. 딱 한 줄.
 
소름 포인트
이게 5년 반복되면 어떻게 되는지. 딱 한 줄. 읽고 나서 침묵이 오도록.
 
4개 장면:
연인 관계 — 친밀감이 깊어지는 순간의 패턴
친구 관계 — 내가 주는 쪽이 되는 순간의 패턴
직장 사회 — 의견을 말해야 할 때의 패턴
혼자 있을 때 — 힘든 일이 끝난 직후의 패턴
 
개인화 원칙 (해당 패턴 반드시 적용):
방어기제 높음 → 감정보다 분석 해결이 먼저 나오는 장면
애착유형 높음 → 가까워질수록 불안해지거나 거리두는 장면
인지왜곡 높음 → 중립 상황을 부정적으로 해석하는 장면
신체신호 높음 → 특정 상황에서 신체반응이 먼저 오는 장면
과도한통제 높음 → 맡기지 못하고 직접 해야 안심인 장면
자책죄책감 높음 → 내 탓이 자동으로 나오는 장면
회복탄력성 높음 → 잘 이겨내지만 이후 공허한 장면
감정인식 낮음 → 감정이 있는데 뭔지 모르겠어로 끝나는 장면
자기자비 낮음 → 자신에게만 가혹한 기준 적용하는 장면
심리적유연성 낮음 → 안 통하는데 같은 방식 반복하는 장면
 
금기: 심리학 이론 언급 금지. "보통 이런 유형은" 일반화 금지.
지표 이름 직접 언급 금지. 추상 묘사 금지. 마크다운 기호 절대 금지.`;
}
 
function buildS4Prompt(data, s1hl){
  return `[S1_HEADLINE: ${s1hl}]
${buildCommonData(data)}
 
섹션 4를 4파트 구성으로 작성해주세요. 각 파트 생략 금지.
마크다운 기호(#, **, --, --- 등) 절대 금지.
 
발견 3가지
발견 1: 가장 높은 위험패턴 2개의 연결 구조. "발견 1 — [제목]" 형식으로 시작. 3문장 이상.
발견 2: 위험 지표와 자원 지표의 역설적 조합이 만드는 것. "발견 2 — [제목]" 형식. 3문장 이상.
발견 3: 이 사람이 가장 모르고 있는 맹점. "발견 3 — [제목]" 형식. 3문장 이상.
 
패턴 연쇄 구조
상황에서 자동반응 → 결과 → 강화로 이어지는 루프를 한 단락으로.
이 루프가 왜 스스로 끊기 어려운지 설명.
 
역설
가장 강점처럼 보이는 것이 실은 가장 큰 부담인 구조.
형식에 맞추지 말고 이 사람의 데이터에서 나오는 역설을 자연스럽게. 2~3가지.
 
기능적 이득
이 패턴이 주는 것 3가지. 이 패턴이 빼앗는 것 3가지.
기호나 표 없이 문장으로.
 
금기: 마크다운 기호 절대 금지. 위로 공감 금지. 임상 용어 금지. 지표 이름 금지.`;
}
 
function buildS5Prompt(data,s1hl){
  return `[S1_HEADLINE: ${s1hl}]
${buildCommonData(data)}
 
섹션 5를 작성해주세요.
마크다운 기호(#, ##, **, --, ---, *, >, 코드블록기호) 절대 금지. 문장과 줄바꿈으로만.
 
이 섹션의 목적: "이걸 바꾸지 않으면 안 되겠다"가 오는 것.
차분한 서술이 아니라, 이미 일어나고 있는 것을 미래 시점에서 보여주는 방식으로.
"이렇게 될 수 있어요"가 아니라 "이미 이러고 있지 않나요?"의 톤.
 
바꾸지 않을 때
 
3년 후
현재 패턴이 조금 더 굳어진 구체적 장면. 2~3문장.
가장 가까운 사람과의 관계에서 일어나는 변화를 구체적 대사나 장면으로.
"이게 3년 후 단미님을 가장 오래 알아온 사람이 하는 말이에요"처럼.
 
5년 후
관계와 일 모두에서 쌓인 결과. 2~3문장.
상대방이 이 사람에 대해 어떤 말을 하게 되는지 구체적 대사로.
그 말이 상처가 아니라 그냥 사실처럼 들리는 순간. 그게 더 무서운 이유.
 
10년 후
이 패턴이 완전히 굳었을 때의 모습. 2~3문장.
외부에서는 강한 사람처럼 보이지만 내부에서 느끼는 것.
누군가 "어떻게 그렇게 안 무너져요?"라고 물을 때 대답하지 못하는 이유.
 
바꿀 때
 
3년 후
패턴을 인식하기 시작했을 때의 첫 변화. 2~3문장.
완전한 변화가 아닌, 자동반응 앞에서 0.5초 멈추는 경험이 생기는 것.
 
5년 후
새로운 방식이 쌓였을 때. 2~3문장.
스스로에게 사용하는 언어가 달라진 것. 관계에서 받는 것이 어색하지 않아지는 것.
 
10년 후
강점은 남고 부작용이 줄었을 때. 2~3문장.
이 패턴이 사라진 게 아니라, 이 사람이 이 패턴을 다루게 된 것.
 
마지막 문장 (고정):
지금 이 리포트를 읽고 있다는 것이 — 이미 그 방향이에요.
 
금기: 추상 묘사 절대 금지. 보장 표현 금지. 극단적 공포 금지. 마크다운 기호 절대 금지.`;
}
 
function buildS6Prompt(data, s1hl){
  return `[S1_HEADLINE: ${s1hl}]
${buildCommonData(data)}
 
섹션 6을 작성해주세요.
마크다운 기호 절대 금지. 기호나 화살표(→, -, *, #) 없이 문장으로만.
 
개인 패턴 처방 4가지
위험패턴 "${data.highRisk}" 높은 순서로. 각 처방마다 4요소 전부:
 
처방 1 — [제목]
왜: 이 패턴이 높은 사람에게 이 처방이 효과적인 이유 한 문장.
어떻게: 오늘 당장 가능한 구체적 행동 2~3문장. 숫자와 기간 명시.
주의: 이 패턴을 가진 사람이 빠지기 쉬운 함정 한 문장.
1주일 후: 이렇게 달라진다 한 문장.
 
처방 2, 3, 4도 같은 형식.
 
관계별 처방 4가지
연인 / 친구 / 직장 / 내면 — 각각 구체적 행동 2문장 + 이유 1문장.
 
금기: "마음을 열어라" "생각을 바꿔라" 추상 처방 절대 금지.
물리적 환경 변화, 구체적 대화 방법, 행동 실험으로만.
마크다운 기호 절대 금지.`;
}
 
function buildS7Prompt(data,s1hl){
  return `[S1_HEADLINE: ${s1hl}]
${buildCommonData(data)}
 
섹션 7을 작성해주세요.
마크다운 기호(#, ##, **, --, ---, *, >, 코드블록기호) 절대 금지. 문장과 줄바꿈으로만.
 
첫 문단 (필수): 섹션 5에서 본 "바꾸지 않을 때"의 미래와 연결하여
왜 지금 이 21일이 필요한지 설명. "그 미래를 바꾸는 첫 21일입니다"로 자연스럽게 연결.
 
3주 구조 전부 작성. 각 Day는 "Day N" 으로 시작하고 미션 내용 1~2문장.
 
1주차 인식
패턴이 작동하는 순간 알아채기만. 바꾸려 하지 않음.
Day 1~2: 이 사람의 주요 패턴에서 나오는 구체적 관찰 미션
Day 3~5: 관계 장면에서 관찰 미션
Day 6~7: 기록 미션
 
2주차 개입
자동반응 앞에 1초 멈추는 연습.
Day 8~10: 관계 장면에서 다르게 해보기
Day 11~12: 혼자 있을 때 다르게 해보기
Day 13~14: 직장 사회에서 다르게 해보기
 
3주차 재조정
새로운 반응을 의도적으로 만들기.
Day 15~17: 더 어려운 실험
Day 18~20: 자기 관찰 심화
Day 21: 돌아보기와 다음 단계
 
원칙: 매일 10분 이내. 이 사람의 지표에서 나온 미션. 일반 플랜 금지.
마지막 문장 고정: "21일 후 거울 앞에 서보세요. 달라진 것이 하나라도 있다면 — 그게 진짜 시작이에요."
마크다운 기호 절대 금지.`;
}
 
function buildS8Prompt(data, s1hl){
  return `[S1_HEADLINE: ${s1hl}]
${buildCommonData(data)}
 
섹션 8을 작성해주세요. 닉네임: ${data.nick||'당신'}
마크다운 기호 절대 금지.
 
5파트 구조:
첫째. 이 사람의 리포트를 쓰면서 머릿속에 맴돈 장면 하나
둘째. 이 패턴이 보이지 않는 이유 — "잘 굴러가고 있으니까요"
셋째. 그런데 ${data.nick||'당신'}님은 괜찮은가요? 라는 질문
넷째. 오늘 딱 하나만 — 가장 작고 가능한 행동 하나
다섯째. "오늘 딱 하나만. 그게 전부예요." 와 "라온단미 드림"
 
원칙:
공감 표현 시작 금지. "힘드셨겠어요" 금지.
"전문 심리상담이 아닌, 같은 길을 먼저 걸어온 사람의 편지입니다"를 어딘가에 포함.
라온단미 본인의 경험이 자연스럽게 녹아있어야 함.
분석 용어 지표 이름 절대 금지.
400자 내외.
마크다운 기호 절대 금지.`;
}
 
async function generatePaidResult(data){
  // STAGE 1
  const s1=await callSection(buildS1Prompt(data),2000);
  const hlMatch=s1?.match(/===S1START===([\s\S]*?)===S1END===/);
  const S1_HEADLINE=hlMatch?hlMatch[1].trim():`${data.nick||'당신'}님은 ${data.patternName}인 사람이에요.`;
 
  // STAGE 2
  const s2=await callSection(buildS2Prompt(data,S1_HEADLINE),2500);
 
  // STAGE 3a: S3+S4 병렬
  const [s3,s4]=await Promise.all([
    callSection(buildS3Prompt(data,S1_HEADLINE),4000),
    callSection(buildS4Prompt(data,S1_HEADLINE),4000),
  ]);
 
  // STAGE 3b: S5+S6 병렬
  const [s5,s6]=await Promise.all([
    callSection(buildS5Prompt(data,S1_HEADLINE),3000),
    callSection(buildS6Prompt(data,S1_HEADLINE),4000),
  ]);
 
  // s4 실패 시 단독 재시도
  const s4Final=s4||await callSection(buildS4Prompt(data,S1_HEADLINE),4000);
 
  // STAGE 4: S7
  const s7=await callSection(buildS7Prompt(data,S1_HEADLINE),4000);
 
  // STAGE 5: S8 편지
  const s8=await callSection(buildS8Prompt(data,S1_HEADLINE),1200);
 
  return{s1,s2,s3,s4:s4Final,s5,s6,s7,s8,S1_HEADLINE};
}
 
async function sheet(p){try{await fetch(SHEET_URL,{method:'POST',mode:'no-cors',headers:{'Content-Type':'application/json'},body:JSON.stringify(p)});}catch{}}
 
function useTimer(){
  const [rem,setRem]=useState(null);
  useEffect(()=>{
    const calc=()=>{const now=new Date(),mid=new Date(now);mid.setHours(24,0,0,0);return Math.max(0,Math.floor((mid-now)/1000));};
    setRem(calc());const iv=setInterval(()=>setRem(calc()),1000);return()=>clearInterval(iv);
  },[]);
  const h=rem===null?'--':String(Math.floor(rem/3600)).padStart(2,'0');
  const m=rem===null?'--':String(Math.floor((rem%3600)/60)).padStart(2,'0');
  return{display:h+':'+m,expired:rem===0,active:rem!==null&&rem>0};
}
 
// ── 스타일 상수 ──
const bg='linear-gradient(155deg,#0D0020 0%,#1A0535 40%,#2D1060 100%)';
const ff="'Apple SD Gothic Neo','Noto Sans KR',sans-serif";
const PG={minHeight:'100vh',background:bg,fontFamily:ff,color:'#fff',display:'flex',flexDirection:'column',alignItems:'center',padding:'0 16px 56px'};
const WR={width:'100%',maxWidth:'560px',paddingTop:'16px'};
const BTN={width:'100%',background:'linear-gradient(135deg,#6A1B9A,#9C27B0)',border:'none',borderRadius:'14px',padding:'18px',fontSize:'15.5px',fontWeight:700,color:'#fff',cursor:'pointer'};
const BTN_GOLD={...BTN,background:'linear-gradient(135deg,#E65100,#FF6F00)'};
const GHOST={width:'100%',background:'transparent',border:'1px solid rgba(255,255,255,0.14)',borderRadius:'12px',padding:'13px',color:'rgba(255,255,255,0.48)',fontSize:'13px',cursor:'pointer',marginTop:'9px'};
const INP={width:'100%',background:'rgba(255,255,255,0.06)',border:'1.5px solid rgba(206,147,216,0.3)',borderRadius:'10px',padding:'13px 16px',color:'#fff',fontSize:'15px',outline:'none',boxSizing:'border-box'};
const LBL={fontSize:'10px',letterSpacing:'4px',color:'rgba(255,255,255,0.28)',textTransform:'uppercase'};
const BACK={background:'none',border:'none',color:'rgba(255,255,255,0.38)',cursor:'pointer',fontSize:'18px',padding:'0'};
 
function Prog({pct,color}){return(<div style={{height:'3px',background:'rgba(255,255,255,0.07)',borderRadius:'2px'}}><div style={{height:'100%',width:pct+'%',background:color||'#CE93D8',borderRadius:'2px',transition:'width 0.35s'}}/></div>);}
function OBtn({active,color,onClick,children}){const c=color||'#CE93D8';return(<button onClick={onClick} style={{background:active?'rgba(206,147,216,0.13)':'rgba(255,255,255,0.04)',border:'1.5px solid '+(active?c:'rgba(255,255,255,0.09)'),borderRadius:'12px',padding:'13px 16px',color:active?'#fff':'rgba(255,255,255,0.7)',fontSize:'14px',cursor:'pointer',display:'flex',alignItems:'center',gap:'12px',width:'100%',transition:'all 0.14s',textAlign:'left'}}><div style={{width:'20px',height:'20px',borderRadius:'50%',border:'1.5px solid '+(active?c:'rgba(255,255,255,0.22)'),background:active?c:'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:700}}>{active?'✓':''}</div>{children}</button>);}
function CkBtn({active,onClick,children}){return(<div onClick={onClick} style={{display:'flex',alignItems:'flex-start',gap:'11px',background:active?'rgba(206,147,216,0.09)':'rgba(255,255,255,0.03)',border:'1px solid '+(active?'rgba(206,147,216,0.36)':'rgba(255,255,255,0.06)'),borderRadius:'11px',padding:'12px 14px',cursor:'pointer',transition:'all 0.14s'}}><div style={{width:'17px',height:'17px',borderRadius:'4px',border:'1.5px solid '+(active?'#CE93D8':'rgba(255,255,255,0.2)'),background:active?'#CE93D8':'transparent',flexShrink:0,marginTop:'2px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:700}}>{active?'✓':''}</div><span style={{fontSize:'13.5px',color:active?'#fff':'rgba(255,255,255,0.6)',lineHeight:1.6}}>{children}</span></div>);}
 
function BizFtr({go}){return(<div style={{marginTop:'22px',padding:'13px',background:'rgba(0,0,0,0.18)',borderRadius:'9px',fontSize:'9.5px',color:'rgba(255,255,255,0.22)',lineHeight:2.0}}><div>상호: {BIZ.name}</div><div>대표자: {BIZ.rep}</div><div>사업자등록번호: {BIZ.regNo}</div><div>통신판매업 신고번호: {BIZ.saleNo}</div><div>이메일: {BIZ.email}</div><div style={{fontSize:'8.5px',marginTop:'3px',paddingTop:'4px',borderTop:'1px solid rgba(255,255,255,0.06)',lineHeight:1.6}}>{BIZ.addr}</div><div style={{display:'flex',gap:'11px',flexWrap:'wrap',marginTop:'8px'}}><button onClick={()=>go(SC.PRIVACY)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.32)',fontSize:'9.5px',cursor:'pointer',padding:0,textDecoration:'underline'}}>개인정보처리방침</button><button onClick={()=>go(SC.REFUND)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.32)',fontSize:'9.5px',cursor:'pointer',padding:0,textDecoration:'underline'}}>환불정책</button><button onClick={()=>go(SC.TERMS)} style={{background:'none',border:'none',color:'rgba(255,255,255,0.32)',fontSize:'9.5px',cursor:'pointer',padding:0,textDecoration:'underline'}}>이용약관</button></div><div style={{marginTop:'6px',fontSize:'8.5px',color:'rgba(255,255,255,0.15)'}}>© 2026 {BIZ.name}. 본 서비스는 전문 심리상담 및 의료 행위를 대체하지 않는 자기계발 목적 콘텐츠입니다.</div></div>);}
 
function Legal({title,onBack,children}){return(<div><button onClick={onBack} style={{...BACK,marginBottom:'14px',fontSize:'13px',color:'rgba(255,255,255,0.35)',display:'flex',alignItems:'center',gap:'5px'}}>← 돌아가기</button><div style={{...LBL,color:'#CE93D8',marginBottom:'7px'}}>{title}</div><div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(206,147,216,0.14)',borderRadius:'13px',padding:'18px',fontSize:'12px',color:'rgba(255,255,255,0.55)',lineHeight:1.85}}>{children}</div></div>);}
 
function MidMsg({msg,onClose}){return(<div style={{position:'fixed',inset:0,background:'rgba(13,0,32,0.88)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100,padding:'24px'}} onClick={onClose}><div style={{background:'linear-gradient(145deg,#1A0535,#2D1060)',border:'1px solid rgba(206,147,216,0.3)',borderRadius:'18px',padding:'28px 24px',maxWidth:'360px',textAlign:'center'}} onClick={e=>e.stopPropagation()}><div style={{fontSize:'26px',color:'#CE93D8',fontWeight:300,marginBottom:'9px'}}>✦</div><div style={{fontSize:'16px',fontWeight:700,marginBottom:'7px'}}>{msg.title}</div><p style={{fontSize:'13.5px',color:'rgba(255,255,255,0.65)',lineHeight:1.85,marginBottom:'17px'}}>{msg.body}</p><button onClick={onClose} style={{background:'rgba(206,147,216,0.15)',border:'1px solid rgba(206,147,216,0.3)',borderRadius:'10px',padding:'11px 24px',color:'#fff',fontSize:'14px',cursor:'pointer',fontWeight:600}}>계속하기 →</button></div></div>);}
 
// ── 블러 카드 컴포넌트 ──
function BlurCard({title,hint,locked=true}){
  return(
    <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'14px 16px',marginBottom:'8px',position:'relative',overflow:'hidden'}}>
      <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
        <div style={{width:'8px',height:'8px',borderRadius:'50%',background:locked?'#EF5350':'#66BB6A',flexShrink:0}}/>
        <div style={{fontSize:'13px',fontWeight:700,color:locked?'rgba(255,255,255,0.7)':'#fff'}}>{title}</div>
      </div>
      {hint&&<div style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',lineHeight:1.7,marginBottom:locked?'8px':'0'}}>{hint}</div>}
      {locked&&(
        <div style={{position:'relative'}}>
          <div style={{fontSize:'12px',lineHeight:1.75,color:'rgba(255,255,255,0.15)',userSelect:'none'}}>
            {'이 분석은 결제 후 전체 내용을 확인할 수 있어요. 성장환경과 현재 패턴의 간극에서 읽어낸 내용이에요.'.split('').map((_,i)=>i%3===0?' ':'█').join('')}
          </div>
          <div style={{position:'absolute',inset:0,backdropFilter:'blur(4px)',background:'rgba(13,0,32,0.4)',borderRadius:'6px'}}/>
        </div>
      )}
    </div>
  );
}
 
// ── 유료 결과 섹션 컴포넌트들 ──
function PaidSection({title,children,accent='#CE93D8'}){
  return(
    <div style={{marginBottom:'22px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'12px'}}>
        <div style={{width:'4px',height:'20px',background:accent,borderRadius:'2px',flexShrink:0}}/>
        <div style={{fontSize:'13pt',fontWeight:700,color:'#fff',letterSpacing:'-0.3px'}}>{title}</div>
      </div>
      {children}
    </div>
  );
}
 
function FindingCard({num,title,body,accent}){
  const colors=['#CE93D8','#F48FB1','#80DEEA'];
  const c=accent||colors[(num-1)%3];
  return(
    <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'16px',marginBottom:'10px'}}>
      <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'8px'}}>
        <div style={{background:c+'22',border:'1px solid '+c+'44',borderRadius:'6px',padding:'2px 8px',fontSize:'10px',fontWeight:700,color:c}}>발견 {num}</div>
        <div style={{fontSize:'12.5pt',fontWeight:700,color:'#fff',flex:1}}>{title}</div>
      </div>
      <p style={{fontSize:'10.5pt',lineHeight:1.95,color:'rgba(255,255,255,0.78)',margin:0}}>{body}</p>
    </div>
  );
}
 
function SceneCard({title,sit,trigger,inner,repeat,accent}){
  return(
    <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.07)',borderRadius:'12px',overflow:'hidden',marginBottom:'10px'}}>
      <div style={{background:accent||'#6A1B9A',padding:'8px 14px',fontSize:'10px',fontWeight:700,color:'#fff',letterSpacing:'1px'}}>{title}</div>
      <div style={{padding:'12px 14px'}}>
        {[['상황',sit],['반응',trigger],['내면',inner],['반복',repeat]].map(([k,v])=>v&&(
          <div key={k} style={{display:'flex',gap:'10px',marginBottom:'8px',alignItems:'flex-start'}}>
            <div style={{fontSize:'9px',color:accent||'#CE93D8',fontWeight:700,minWidth:'20px',paddingTop:'2px'}}>{k}</div>
            <div style={{fontSize:'10pt',color:'rgba(255,255,255,0.75)',lineHeight:1.85,flex:1}}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
 
// ── 메인 앱 ──
export default function App(){
  const [sc,setSc]=useState(SC.INTRO);
  const [prev,setPrev]=useState(SC.RESULT);
  const [care,setCare]=useState([]);
  const [p0,setP0]=useState({});
  const [p0i,setP0i]=useState(0);
  const [dimi,setDimi]=useState(0);
  const [qi,setQi]=useState(0);
  const [ans,setAns]=useState({});
  const [email,setEmail]=useState('');
  const [nick,setNick]=useState('');
  const [mkt,setMkt]=useState(false);
  const [agreed,setAgreed]=useState(false);
  const [err,setErr]=useState('');
  const [anim,setAnim]=useState(false);
  const [sel,setSel]=useState(null);
  const [scores,setScores]=useState(null);
  const [freeData,setFreeData]=useState(null); // 무료 결과 AI 데이터
  const [paidData,setPaidData]=useState(null); // 유료 결과 AI 데이터
  const [ckd,setCkd]=useState([]);
  const [midMsg,setMidMsg]=useState(null);
  const timer=useTimer();
 
  const maxTotal=DIMS.reduce((a,d)=>a+d.qs.length*5,0);
 
  useEffect(()=>{window.scrollTo({top:0,behavior:'instant'});},[sc]);
 
  function goLegal(s){setPrev(sc);setSc(s);}
  function backLegal(){setSc(prev);}
  function animate(fn){setAnim(true);setTimeout(()=>{fn();setAnim(false);setSel(null);},255);}
  function reset(){setSc(SC.INTRO);setAns({});setP0({});setP0i(0);setDimi(0);setQi(0);setEmail('');setNick('');setFreeData(null);setPaidData(null);setScores(null);setCkd([]);setCare([]);setAgreed(false);setMidMsg(null);}
 
  function goBack(){
    if(sc===SC.P0){if(p0i>0){setP0i(p0i-1);setSel(null);}else setSc(SC.CAREGIVER);}
    else if(sc===SC.P1){if(qi>0){setQi(qi-1);setSel(null);}else if(dimi>0){setDimi(dimi-1);setQi(DIMS[dimi-1].qs.length-1);setSel(null);}else{setSc(SC.P0);setP0i(P0Q.length-1);}}
    else if(sc===SC.EMAIL){setSc(SC.P1);setDimi(DIMS.length-1);setQi(DIMS[DIMS.length-1].qs.length-1);}
    else if(sc===SC.CAREGIVER)setSc(SC.INTRO);
  }
 
  function pick0(v){setSel(v);setTimeout(()=>{setP0(p=>({...p,['p0_'+p0i]:v}));animate(()=>{if(p0i<P0Q.length-1)setP0i(p0i+1);else setSc(SC.P1);});},140);}
  function pick1(v){
    setSel(v);
    const k=DIMS[dimi].id+'_'+qi;
    setTimeout(()=>{
      const nA={...ans,[k]:v};setAns(nA);
      const nD=Object.keys(nA).length;
      if(MID_MSGS[nD]){setMidMsg(MID_MSGS[nD]);return;}
      animate(()=>{if(qi<DIMS[dimi].qs.length-1)setQi(qi+1);else if(dimi<DIMS.length-1){setDimi(dimi+1);setQi(0);}else setSc(SC.EMAIL);});
    },140);
  }
  function afterMid(){setMidMsg(null);animate(()=>{if(qi<DIMS[dimi].qs.length-1)setQi(qi+1);else if(dimi<DIMS.length-1){setDimi(dimi+1);setQi(0);}else setSc(SC.EMAIL);});}
 
  async function submit(){
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)){setErr('올바른 이메일 주소를 입력해주세요');return;}
    if(!agreed){setErr('개인정보 수집 이용에 동의해주세요');return;}
    setErr('');
    const s=calcScores(ans);setScores(s);setSc(SC.LOADING);
    const aData=buildAnalysisData(s,p0,care,nick,ckd);
    const pl={nick:nick||'익명',email,marketing:mkt?'동의':'미동의',total:s.total,maxTotal,type:getType(s.total).type,caregivers:care.join(','),patternName:aData.patternName,intro_checklist:ckd.map(i=>i+1).join(',')};
    P0Q.forEach((_,i)=>{pl['p0_'+i]=p0['p0_'+i]||0;});
    DIMS.forEach(d=>{d.qs.forEach((_,i)=>{pl[d.id+'_'+i]=ans[d.id+'_'+i]||0;});});
    sheet(pl);
    const fd=await generateFreeInsight(aData);
    setFreeData({...fd,analysisData:aData});
    setSc(SC.RESULT);
  }
 
  async function handlePay(){
    if(SIM_MODE||true){ // 결제 연동 전: 시뮬레이션
      setSc(SC.PAID_LOADING);
      const aData=freeData?.analysisData||buildAnalysisData(scores,p0,care,nick);
      const pd=await generatePaidResult(aData);
      setPaidData({...pd,analysisData:aData});
      setSc(SC.PAID);
    }
  }
 
  const totalQs=DIMS.reduce((a,d)=>a+d.qs.length,0);
  const doneSF=DIMS.slice(0,dimi).reduce((a,d)=>a+d.qs.length,0)+qi;
 
  return(
    <div style={PG}>
      <div style={WR}>
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}@keyframes fadeUp{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}*{-webkit-tap-highlight-color:transparent;}button{-webkit-appearance:none;} @media print{body{background:#fff!important;color:#000!important;}.no-print{display:none!important;}}`}</style>
        {midMsg&&<MidMsg msg={midMsg} onClose={afterMid}/>}
 
        {/* ══ INTRO ══ */}
        {sc===SC.INTRO&&(
          <div>
            <div style={{textAlign:'center',marginBottom:'8px',padding:'10px 0 4px'}}>
              <div style={{fontSize:'9.5px',letterSpacing:'5px',color:'rgba(206,147,216,0.55)',textTransform:'uppercase',marginBottom:'14px',animation:'fadeUp 0.5s ease both'}}>심리 독립 프로젝트 · 라온단미</div>
              <h1 style={{fontSize:'clamp(26px,7vw,36px)',fontWeight:900,lineHeight:1.15,letterSpacing:'-1.5px',marginBottom:'8px',animation:'fadeUp 0.6s ease 0.1s both'}}>
                나는 왜<br/><span style={{color:'#CE93D8'}}>항상 이럴까?</span>
              </h1>
              <p style={{fontSize:'clamp(13px,3.5vw,15px)',color:'rgba(255,255,255,0.48)',lineHeight:1.75,animation:'fadeUp 0.6s ease 0.2s both',marginBottom:'4px'}}>이 질문을 한 번이라도 해본 적 있다면</p>
              <p style={{fontSize:'12px',color:'rgba(255,255,255,0.32)',animation:'fadeUp 0.6s ease 0.25s both'}}>10개 지표로 내 심리 패턴의 원인과 변화 경로를 찾는 — <strong style={{color:'rgba(255,255,255,0.5)'}}>심리 독립</strong> 테스트</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'7px',margin:'14px 0',animation:'fadeUp 0.6s ease 0.3s both'}}>
              {[{icon:'◉',t:'원인 파악',d:'왜 반복되는지'},{icon:'◈',t:'패턴 구조',d:'어디서 작동하는지'},{icon:'◇',t:'변화 경로',d:'어떻게 달라지는지'}].map((item,i)=>(
                <div key={i} style={{background:'rgba(206,147,216,0.07)',border:'1px solid rgba(206,147,216,0.14)',borderRadius:'10px',padding:'10px 8px',textAlign:'center'}}>
                  <div style={{fontSize:'16px',color:'#CE93D8',marginBottom:'4px'}}>{item.icon}</div>
                  <div style={{fontSize:'11px',fontWeight:700,color:'#fff',marginBottom:'2px'}}>{item.t}</div>
                  <div style={{fontSize:'9.5px',color:'rgba(255,255,255,0.4)'}}>{item.d}</div>
                </div>
              ))}
            </div>
            <div style={{...LBL,textAlign:'center',marginBottom:'10px',color:'rgba(255,255,255,0.32)'}}>혹시 이런 감각이 있나요?</div>
            <div style={{display:'flex',flexDirection:'column',gap:'7px',marginBottom:'16px'}}>
              {CHECKLIST.map((item,i)=>(<CkBtn key={i} active={ckd.includes(i)} onClick={()=>setCkd(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i])}>{item}</CkBtn>))}
            </div>
            <div style={{background:'rgba(206,147,216,0.07)',border:'1px solid rgba(206,147,216,0.15)',borderRadius:'14px',padding:'16px 17px',marginBottom:'16px',textAlign:'center'}}>
              <p style={{fontSize:'14.5px',lineHeight:1.85,color:'rgba(255,255,255,0.82)',marginBottom:'6px'}}>
                {ckd.length===0&&'하나라도 내 얘기다 싶은 게 있다면'}
                {ckd.length>=1&&ckd.length<=3&&ckd.length+'가지가 마음에 걸렸군요.'}
                {ckd.length>=4&&ckd.length<=7&&ckd.length+'가지나 해당됐군요.'}
                {ckd.length>=8&&'상당히 많은 부분이 해당됐군요.'}
              </p>
              <p style={{fontSize:'14.5px',lineHeight:1.85,color:'rgba(255,255,255,0.82)',marginBottom:'6px'}}>
                그건 의지가 약해서도 성격이 이상해서도 아니에요.<br/>
                <strong style={{color:'#CE93D8'}}>오래된 패턴이 지금도 작동하고 있는 거예요.</strong>
              </p>
              <p style={{fontSize:'13px',lineHeight:1.8,color:'rgba(255,255,255,0.5)'}}>12분 동안 나 자신을 탐구해볼까요?<br/><span style={{color:'rgba(255,255,255,0.35)'}}>10개 지표 · 62문항으로 지금 바로 시작할 수 있어요.</span></p>
            </div>
            <button style={BTN} onClick={()=>setSc(SC.CAREGIVER)}>내 심리 독립 시작하기 →</button>
            {SIM_MODE&&<div style={{marginTop:'8px',padding:'6px',background:'rgba(255,200,0,0.08)',borderRadius:'8px',textAlign:'center',fontSize:'10px',color:'rgba(255,200,0,0.7)'}}>🔧 시뮬레이션 모드 — 결제 연동 전 테스트</div>}
            <BizFtr go={goLegal}/>
          </div>
        )}
 
        {/* ══ CAREGIVER ══ */}
        {sc===SC.CAREGIVER&&(
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
              <button onClick={goBack} style={BACK}>←</button>
              <span style={{...LBL,letterSpacing:'3px'}}>시작 전 확인</span>
            </div>
            <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(206,147,216,0.18)',borderRadius:'14px',padding:'16px',marginBottom:'14px'}}>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.3)',marginBottom:'11px'}}>만 18세 이전을 기준으로 응답해주세요</div>
              <div style={{fontSize:'clamp(15px,3.5vw,17px)',fontWeight:600,lineHeight:1.7}}>나를 주로 돌봐준 사람은 누구였나요?<br/><span style={{fontSize:'12.5px',color:'rgba(255,255,255,0.33)',fontWeight:400}}>중복 선택 가능합니다</span></div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'7px',marginBottom:'15px'}}>
              {CAREGIVER_OPTS.map(o=>{const a=care.includes(o.id);return(<button key={o.id} onClick={()=>setCare(p=>p.includes(o.id)?p.filter(x=>x!==o.id):[...p,o.id])} style={{background:a?'rgba(206,147,216,0.13)':'rgba(255,255,255,0.04)',border:'1.5px solid '+(a?'#CE93D8':'rgba(255,255,255,0.09)'),borderRadius:'11px',padding:'12px 14px',color:a?'#fff':'rgba(255,255,255,0.67)',fontSize:'14px',cursor:'pointer',display:'flex',alignItems:'center',gap:'11px',width:'100%',textAlign:'left'}}><div style={{width:'17px',height:'17px',borderRadius:'4px',border:'1.5px solid '+(a?'#CE93D8':'rgba(255,255,255,0.18)'),background:a?'#CE93D8':'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:700}}>{a?'✓':''}</div>{o.label}</button>);})}
            </div>
            <button style={{...BTN,opacity:care.length===0?0.42:1}} disabled={care.length===0} onClick={()=>setSc(SC.P0)}>다음 →</button>
          </div>
        )}
 
        {/* ══ PART 0 ══ */}
        {sc===SC.P0&&(
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
              <button onClick={goBack} style={BACK}>←</button>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'5px'}}>
                  <span style={{...LBL,color:'#CE93D8',letterSpacing:'2px'}}>성장 환경</span>
                  <span style={{fontSize:'11px',color:'rgba(255,255,255,0.28)'}}>{p0i+1} / {P0Q.length}</span>
                </div>
                <Prog pct={(p0i+1)/P0Q.length*100}/>
              </div>
            </div>
            <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(206,147,216,0.18)',borderRadius:'14px',padding:'16px',marginBottom:'14px',opacity:anim?0:1,transform:anim?'translateY(8px)':'none',transition:'all 0.28s'}}>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.28)',marginBottom:'12px'}}>어린 시절 기준으로 응답해주세요</div>
              <div style={{fontSize:'clamp(14px,3.2vw,16.5px)',fontWeight:600,lineHeight:1.9}}>{P0Q[p0i]}</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'7px'}}>
              {P0_OPTS.map(o=><OBtn key={o.v} active={sel===o.v} onClick={()=>pick0(o.v)}>{o.l}</OBtn>)}
            </div>
          </div>
        )}
 
        {/* ══ PART 1 ══ */}
        {sc===SC.P1&&(
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
              <button onClick={goBack} style={BACK}>←</button>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:'5px'}}>
                  <span style={{fontSize:'11px',color:'rgba(255,255,255,0.33)'}}>{Object.keys(ans).length+1} / {totalQs}</span>
                  <span style={{fontSize:'11px',color:'rgba(255,255,255,0.2)'}}>{Math.round(doneSF/totalQs*100)}%</span>
                </div>
                <Prog pct={doneSF/totalQs*100} color={DIMS[dimi].color}/>
              </div>
            </div>
            <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(206,147,216,0.18)',borderRadius:'14px',padding:'16px',marginBottom:'14px',opacity:anim?0:1,transform:anim?'translateY(8px)':'none',transition:'all 0.28s'}}>
              <div style={{fontSize:'11px',color:'rgba(255,255,255,0.26)',marginBottom:'12px'}}>현재를 기준으로 솔직하게 응답해주세요</div>
              <div style={{fontSize:'clamp(13px,3vw,16px)',fontWeight:600,lineHeight:1.95}}>{DIMS[dimi].qs[qi]}</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'7px'}}>
              {OPTS.map(o=><OBtn key={o.v} active={sel===o.v} color={DIMS[dimi].color} onClick={()=>pick1(o.v)}>{o.l}</OBtn>)}
            </div>
            <div style={{marginTop:'13px',display:'flex',gap:'2px'}}>
              {DIMS.map((d,i)=><div key={d.id} style={{flex:1,height:'2px',borderRadius:'2px',background:i<dimi?d.color:i===dimi?d.color+'AA':'rgba(255,255,255,0.06)',transition:'background 0.3s'}}/>)}
            </div>
          </div>
        )}
 
        {/* ══ EMAIL ══ */}
        {sc===SC.EMAIL&&(
          <div style={{textAlign:'center'}}>
            <button onClick={goBack} style={{...GHOST,width:'auto',padding:'8px 15px',marginBottom:'16px',marginTop:0}}>← 이전 질문으로</button>
            <div style={{fontSize:'24px',marginBottom:'9px',color:'#CE93D8',fontWeight:300}}>✦</div>
            <h2 style={{fontSize:'21px',fontWeight:800,marginBottom:'5px',letterSpacing:'-0.5px'}}>62문항 완료</h2>
            <p style={{color:'rgba(255,255,255,0.4)',marginBottom:'18px',lineHeight:1.7,fontSize:'13px'}}>이메일을 입력하면 무료 결과를 바로 확인할 수 있어요</p>
            <div style={{textAlign:'left',display:'flex',flexDirection:'column',gap:'11px',marginBottom:'13px'}}>
              <div><label style={{...LBL,display:'block',marginBottom:'5px',color:'#CE93D8'}}>닉네임 (선택)</label><input value={nick} onChange={e=>setNick(e.target.value)} placeholder="예: 별빛, 익명" style={INP}/></div>
              <div>
                <label style={{...LBL,display:'block',marginBottom:'5px',color:'#CE93D8'}}>이메일 주소 <span style={{color:'#EF5350'}}>*</span></label>
                <input value={email} onChange={e=>{setEmail(e.target.value);setErr('');}} placeholder="example@email.com" type="email" style={{...INP,borderColor:err?'#EF5350':'rgba(206,147,216,0.3)'}}/>
                {err&&<div style={{color:'#EF5350',fontSize:'12px',marginTop:'5px'}}>{err}</div>}
              </div>
              <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(206,147,216,0.1)',borderRadius:'10px',padding:'12px 14px'}}>
                <label style={{display:'flex',gap:'10px',alignItems:'flex-start',marginBottom:'8px',cursor:'pointer'}}>
                  <input type="checkbox" checked={agreed} onChange={e=>{setAgreed(e.target.checked);setErr('');}} style={{marginTop:'2px'}}/>
                  <span style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',lineHeight:1.65}}><strong style={{color:'rgba(255,255,255,0.75)'}}>[필수] 개인정보 수집 이용 동의</strong><br/>테스트 결과 발송 목적으로만 사용합니다.{' '}<button onClick={()=>goLegal(SC.PRIVACY)} style={{background:'none',border:'none',color:'#CE93D8',fontSize:'11px',cursor:'pointer',padding:0,textDecoration:'underline'}}>내용 보기</button></span>
                </label>
                <label style={{display:'flex',gap:'10px',alignItems:'flex-start',cursor:'pointer'}}>
                  <input type="checkbox" checked={mkt} onChange={e=>setMkt(e.target.checked)} style={{marginTop:'2px'}}/>
                  <span style={{fontSize:'12px',color:'rgba(255,255,255,0.5)',lineHeight:1.65}}><strong style={{color:'rgba(255,255,255,0.75)'}}>[선택] 마케팅 정보 수신 동의</strong></span>
                </label>
              </div>
            </div>
            <button style={BTN} onClick={submit}>무료 결과 확인하기 →</button>
          </div>
        )}
 
        {/* ══ LOADING ══ */}
        {sc===SC.LOADING&&(
          <div style={{textAlign:'center',paddingTop:'50px'}}>
            <div style={{width:'46px',height:'46px',border:'2px solid rgba(206,147,216,0.1)',borderTopColor:'#CE93D8',borderRadius:'50%',margin:'0 auto 17px',animation:'spin 1s linear infinite'}}/>
            <h3 style={{fontSize:'16px',marginBottom:'6px',fontWeight:700}}>10개 패턴 분석 중</h3>
            <p style={{color:'rgba(255,255,255,0.32)',fontSize:'13px'}}>62개 응답을 종합해 패턴 이름을 찾고 있어요</p>
          </div>
        )}
 
        {/* ══ FREE RESULT ══ */}
        {sc===SC.RESULT&&scores&&(()=>{
          const ti=getType(scores.total);
          const ptn=lookupPattern(scores.dimScores);
          const aData=freeData?.analysisData||buildAnalysisData(scores,p0,care,nick,ckd);
          const fd=freeData;
          const A=fd?.A_pattern, B=fd?.B_checklist, C=fd?.C_scene, D=fd?.D_blur, E=fd?.E_discovery, F=fd?.F_future, G=fd?.G_cta;
 
          // 소형 CTA 버튼 (C 아래 첫 번째)
          const SmallCTA=()=>(
            <button onClick={handlePay} style={{width:'100%',background:'rgba(206,147,216,0.12)',border:'1px solid rgba(206,147,216,0.3)',borderRadius:'10px',padding:'10px',color:'#CE93D8',fontSize:'12.5px',fontWeight:700,cursor:'pointer',marginTop:'10px',marginBottom:'4px'}}>
              {G?.button_text||'왜 이러는지 처음으로 알기'} →
            </button>
          );
 
          return(
            <div>
              <div style={{...LBL,textAlign:'center',marginBottom:'12px'}}>심리 독립 프로젝트 · 무료 결과</div>
 
              {/* ── A: 패턴 이름 히어로 ── */}
              <div style={{background:'linear-gradient(135deg,#1A0535,#2D1060)',border:'1.5px solid rgba(206,147,216,0.4)',borderRadius:'16px',padding:'22px 18px',marginBottom:'10px',textAlign:'center'}}>
                <div style={{fontSize:'9px',letterSpacing:'4px',color:'rgba(206,147,216,0.6)',textTransform:'uppercase',marginBottom:'10px'}}>당신은</div>
                <div style={{fontSize:'clamp(18px,5vw,23px)',fontWeight:900,color:'#fff',letterSpacing:'-0.5px',lineHeight:1.3,marginBottom:'8px'}}>{A?.name||ptn.name}</div>
                <div style={{width:'24px',height:'2px',background:'rgba(206,147,216,0.4)',margin:'0 auto 9px'}}/>
                <div style={{fontSize:'12.5px',color:'rgba(255,255,255,0.55)',lineHeight:1.8,marginBottom:A?.reveal_text?'8px':'0'}}>{A?.desc||ptn.sub}</div>
                {A?.reveal_text&&<div style={{fontSize:'13px',color:'rgba(206,147,216,0.9)',fontWeight:600,lineHeight:1.7,marginTop:'6px',paddingTop:'8px',borderTop:'1px solid rgba(206,147,216,0.15)'}}>{A.reveal_text}</div>}
              </div>
 
              {/* 유형 뱃지 */}
              <div style={{display:'flex',justifyContent:'center',marginBottom:'16px'}}>
                <div style={{background:ti.bg,border:'1px solid '+ti.border+'50',borderRadius:'9px',padding:'5px 14px',display:'inline-flex',alignItems:'center',gap:'6px'}}>
                  <span style={{fontSize:'12px',color:ti.color,fontWeight:900}}>{ti.symbol}</span>
                  <span style={{fontSize:'11px',fontWeight:700,color:ti.color}}>{ti.type} — {ti.detail}</span>
                </div>
              </div>
 
              {/* ── B: 체크리스트 연결 [트리거] ── */}
              {B&&B.items&&B.items.length>0&&(
                <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(206,147,216,0.15)',borderRadius:'12px',padding:'14px 16px',marginBottom:'12px'}}>
                  <div style={{...LBL,color:'#CE93D8',marginBottom:'10px'}}>테스트 시작 전 체크했던 것들</div>
                  {B.items.map((item,i)=>(
                    <div key={i} style={{display:'flex',alignItems:'flex-start',gap:'8px',marginBottom:'7px'}}>
                      <div style={{width:'16px',height:'16px',background:'rgba(206,147,216,0.2)',border:'1px solid rgba(206,147,216,0.4)',borderRadius:'3px',flexShrink:0,marginTop:'2px',display:'flex',alignItems:'center',justifyContent:'center'}}>
                        <span style={{fontSize:'9px',color:'#CE93D8'}}>✓</span>
                      </div>
                      <span style={{fontSize:'12.5px',color:'rgba(255,255,255,0.75)',lineHeight:1.7}}>{item}</span>
                    </div>
                  ))}
                  <div style={{marginTop:'10px',paddingTop:'10px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                    <p style={{fontSize:'12px',color:'rgba(206,147,216,0.8)',marginBottom:'5px',fontWeight:600}}>{B.connection}</p>
                    <p style={{fontSize:'11.5px',color:'rgba(255,255,255,0.4)',margin:0,fontStyle:'italic'}}>{B.tease}</p>
                  </div>
                </div>
              )}
 
              {/* ── C: 구체적 장면 [트리거 1] ── */}
              {C&&(
                <div style={{marginBottom:'12px'}}>
                  <div style={{...LBL,marginBottom:'8px'}}>이 순간이 익숙하신가요?</div>
                  <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'16px',marginBottom:'4px'}}>
                    <p style={{fontSize:'12.5px',color:'rgba(255,255,255,0.6)',lineHeight:1.8,margin:'0 0 8px',fontStyle:'italic'}}>{C.setup}</p>
                    <p style={{fontSize:'13px',color:'rgba(255,255,255,0.85)',lineHeight:1.85,margin:'0 0 10px',fontWeight:500}}>{C.reaction}</p>
                    <div style={{background:'rgba(13,0,32,0.5)',borderLeft:'3px solid #CE93D8',borderRadius:'0 8px 8px 0',padding:'10px 14px',marginBottom:'10px'}}>
                      <p style={{fontSize:'13.5px',color:'#CE93D8',lineHeight:1.85,margin:0,fontWeight:600}}>"{C.cutoff}"</p>
                    </div>
                    <p style={{fontSize:'12px',color:'rgba(255,255,255,0.45)',margin:0,fontStyle:'italic'}}>{C.question}</p>
                  </div>
                  <SmallCTA/>
                </div>
              )}
 
              {/* ── D: 블러 문장 [트리거] ── */}
              {D&&(
                <div style={{background:'rgba(0,0,0,0.2)',border:'1px solid rgba(206,147,216,0.12)',borderRadius:'12px',padding:'16px',marginBottom:'12px',textAlign:'center'}}>
                  <div style={{fontSize:'14px',lineHeight:1.9,color:'rgba(255,255,255,0.7)',marginBottom:'8px'}}>
                    <span>{nick||''}님은 </span>
                    <span style={{
                      background:'rgba(206,147,216,0.15)',
                      borderRadius:'4px',
                      padding:'2px 4px',
                      filter:'blur(5px)',
                      userSelect:'none',
                      color:'#CE93D8',
                      fontWeight:700,
                    }}>{D.blurred}</span>
                    <span> 인 사람이에요.</span>
                  </div>
                  <p style={{fontSize:'12px',color:'rgba(255,255,255,0.35)',margin:0,fontStyle:'italic'}}>{D.below}</p>
                </div>
              )}
 
              {/* ── E: 발견 티저 [트리거 3] ── */}
              {E&&(
                <div style={{marginBottom:'12px'}}>
                  <div style={{...LBL,marginBottom:'8px'}}>당신도 몰랐던 구조</div>
                  <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'14px',marginBottom:'6px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                      <div style={{background:'rgba(206,147,216,0.2)',border:'1px solid rgba(206,147,216,0.4)',borderRadius:'5px',padding:'1px 7px',fontSize:'9px',fontWeight:700,color:'#CE93D8'}}>발견 1</div>
                      <div style={{fontSize:'13px',fontWeight:700,color:'#fff'}}>{E.title}</div>
                    </div>
                    <p style={{fontSize:'11.5px',color:'rgba(255,255,255,0.4)',margin:'0 0 6px',fontStyle:'italic'}}>{E.tease}</p>
                  </div>
                  {Array.from({length:E.locked_count||2}).map((_,i)=>(
                    <div key={i} style={{background:'rgba(255,255,255,0.02)',border:'1px solid rgba(255,255,255,0.05)',borderRadius:'12px',padding:'12px 14px',marginBottom:'5px',display:'flex',alignItems:'center',gap:'8px'}}>
                      <div style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:'5px',padding:'1px 7px',fontSize:'9px',color:'rgba(255,255,255,0.3)'}}>발견 {i+2}</div>
                      <div style={{flex:1,height:'8px',background:'rgba(255,255,255,0.06)',borderRadius:'4px',filter:'blur(2px)'}}/>
                      <span style={{fontSize:'10px',color:'rgba(255,255,255,0.2)'}}>🔒</span>
                    </div>
                  ))}
                </div>
              )}
 
              {/* ── F: 미래 궤적 티저 [트리거 2 — 가장 강한 트리거] ── */}
              {F&&(
                <div style={{background:'rgba(0,0,0,0.25)',border:'1px solid rgba(239,83,80,0.2)',borderRadius:'12px',padding:'16px',marginBottom:'12px'}}>
                  <div style={{...LBL,color:'#EF5350',marginBottom:'10px'}}>지금 이 패턴이 계속된다면</div>
                  <div style={{marginBottom:'10px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'6px'}}>
                      <div style={{fontSize:'9px',background:'rgba(239,83,80,0.2)',color:'#EF5350',padding:'2px 7px',borderRadius:'4px',fontWeight:700}}>3년 후</div>
                    </div>
                    <p style={{fontSize:'12.5px',lineHeight:1.9,color:'rgba(255,255,255,0.75)',margin:0}}>{F.year_3}</p>
                  </div>
                  {['5년 후','10년 후'].map(yr=>(
                    <div key={yr} style={{position:'relative',marginBottom:'6px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                        <div style={{fontSize:'9px',background:'rgba(255,255,255,0.05)',color:'rgba(255,255,255,0.3)',padding:'2px 7px',borderRadius:'4px',fontWeight:700}}>{yr}</div>
                      </div>
                      <div style={{fontSize:'12px',lineHeight:1.8,color:'rgba(255,255,255,0.12)',userSelect:'none',filter:'blur(3.5px)'}}>
                        이 패턴이 관계와 자기 서사와 역할에 방향을 만들어요. 바꾸지 않으면 어떻게 되는지 — 그리고 바꿀 때 어떻게 달라지는지.
                      </div>
                    </div>
                  ))}
                  <div style={{marginTop:'10px',paddingTop:'10px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
                    <p style={{fontSize:'11.5px',color:'rgba(255,255,255,0.4)',margin:'0 0 3px',fontStyle:'italic'}}>{F.tease}</p>
                    {F.hope_hint&&<p style={{fontSize:'11px',color:'rgba(102,187,106,0.6)',margin:0,fontStyle:'italic'}}>{F.hope_hint}</p>}
                  </div>
                </div>
              )}
 
              {/* ── G: 메인 CTA [트리거 5] ── */}
              <div style={{background:'linear-gradient(135deg,rgba(230,81,0,0.1),rgba(106,27,154,0.15))',border:'1px solid rgba(206,147,216,0.2)',borderRadius:'14px',padding:'18px',marginBottom:'12px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px',fontSize:'11px',color:'rgba(255,255,255,0.35)'}}>
                  <span>심리상담 1회</span><span>60,000~150,000원</span>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'10px'}}>
                  <span style={{fontSize:'13px',color:'rgba(255,255,255,0.7)',fontWeight:600}}>심리 독립 전체 분석</span>
                  <span style={{fontSize:'20px',fontWeight:900,color:'#fff'}}>{PRICE}</span>
                </div>
                <p style={{fontSize:'11px',color:'rgba(255,255,255,0.45)',lineHeight:1.85,margin:'0 0 14px',textAlign:'center'}}>
                  {G?.sub_text||'패턴의 뿌리부터 10년 후 궤적까지. 오늘 처음으로 전체를 보게 됩니다.'}<br/>
                  <span style={{color:'rgba(255,255,255,0.3)'}}>화면에서 바로 · 관계 분석 · 처방 · 21일 플랜 · 편지 · PDF 저장</span>
                </p>
                {timer.active&&!timer.expired&&(
                  <div style={{textAlign:'center',marginBottom:'10px',fontSize:'11px',color:'rgba(255,255,255,0.4)'}}>자정까지 <strong style={{color:'#FFA726'}}>{timer.display}</strong> 남았어요</div>
                )}
                <button style={BTN_GOLD} onClick={handlePay}>
                  {G?.button_text||'왜 이러는지 처음으로 알기'} — {PRICE}
                  {SIM_MODE&&' (시뮬레이션)'}
                </button>
              </div>
 
              {/* 공유 버튼 */}
              <button onClick={()=>{const text=`나 심리 독립 테스트 했더니\n"${ptn.name}" 나왔어\n이거 진짜 나임... 너도 해봐\n${SITE_URL}`;navigator.share?navigator.share({title:'심리 독립 테스트',text,url:SITE_URL}).catch(()=>{}):navigator.clipboard?.writeText(text).then(()=>alert('복사됐어요!')).catch(()=>alert(SITE_URL));}} style={{width:'100%',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.11)',borderRadius:'11px',padding:'11px',color:'rgba(255,255,255,0.5)',fontSize:'13px',cursor:'pointer',marginBottom:'13px',display:'flex',alignItems:'center',justifyContent:'center',gap:'8px'}}>
                <span>↗</span> 내 패턴 이름 공유하기
              </button>
 
              {/* 10개 차트 (CTA 아래 참고용) */}
              <div style={{background:'rgba(255,255,255,0.03)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:'12px',padding:'14px',marginBottom:'12px'}}>
                <div style={{...LBL,marginBottom:'10px'}}>10가지 패턴 점수 (참고용)</div>
                {[...scores.dimScores].sort((a,b)=>b.score-a.score).map(d=>{
                  const ds=getDisplayScore(d);const lv=getLev(ds,d.max,d.positive);
                  return(<div key={d.id} style={{marginBottom:'9px'}}>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'3px'}}>
                      <span style={{fontSize:'12px',fontWeight:600,color:'rgba(255,255,255,0.7)'}}>{d.name}</span>
                      <span style={{background:lv.color+'1E',color:lv.color,border:'1px solid '+lv.color+'50',borderRadius:'6px',padding:'1px 7px',fontSize:'9px',fontWeight:700}}>{lv.label}</span>
                    </div>
                    <div style={{height:'4px',background:'rgba(255,255,255,0.06)',borderRadius:'2px'}}>
                      <div style={{height:'100%',width:ds/d.max*100+'%',background:lv.color,borderRadius:'2px',opacity:0.7}}/>
                    </div>
                  </div>);
                })}
              </div>
 
              <button style={GHOST} onClick={reset}>처음부터 다시하기</button>
              <BizFtr go={goLegal}/>
            </div>
          );
        })()}
 
        {/* ══ PAID LOADING ══ */}
        {sc===SC.PAID_LOADING&&(
          <div style={{textAlign:'center',paddingTop:'60px'}}>
            <div style={{width:'52px',height:'52px',border:'2px solid rgba(206,147,216,0.1)',borderTopColor:'#CE93D8',borderRadius:'50%',margin:'0 auto 20px',animation:'spin 1s linear infinite'}}/>
            <h3 style={{fontSize:'17px',marginBottom:'8px',fontWeight:700}}>심층 분석 생성 중</h3>
            <p style={{color:'rgba(255,255,255,0.4)',fontSize:'13px',lineHeight:1.8}}>7개 엔진으로 패턴의 기원, 관계, 미래 궤적을<br/>분석하고 있어요. 약 20~30초 소요돼요.</p>
            <div style={{marginTop:'24px',display:'flex',flexDirection:'column',gap:'8px',maxWidth:'280px',margin:'24px auto 0'}}>
              {['패턴 구조 분석 중','관계별 장면 생성 중','미래 궤적 계산 중','맞춤 처방 설계 중','편지 작성 중'].map((t,i)=>(
                <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',opacity:0.5+i*0.1}}>
                  <div style={{width:'6px',height:'6px',borderRadius:'50%',background:'#CE93D8',flexShrink:0}}/>
                  <span style={{fontSize:'12px',color:'rgba(255,255,255,0.5)'}}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        )}
 
        {/* ══ PAID RESULT ══ */}
        {sc===SC.PAID&&paidData&&scores&&(()=>{
          const ti=getType(scores.total);
          const ptn=lookupPattern(scores.dimScores);
          const {s1,s2,s3,s4,s5,s6,s7,s8,S1_HEADLINE}=paidData;
 
          // ── 텍스트 정제 유틸 (Claude 마커, 불필요 기호 제거) ──
          const cleanText=(t='')=>t
            .replace(/—?\s*\[장면\s*\d+[.\]]/g,'')   // — [장면 2.] 마커 제거
            .replace(/\[장면\s*\d+[.\]]/g,'')          // [장면 N] 제거
            .replace(/^\s*[①②③④⑤⑥⑦⑧⑨⑩]\s*/gm,'')  // 원문자 번호 제거
            .replace(/^\s*(?:첫째|둘째|셋째|넷째)[.\s]/gm,'') // 서수 제거
            .trim();
 
          // ── 단락 분리 렌더 헬퍼 ──
          const Paras=({text,color='rgba(255,255,255,0.82)',size='11pt',lh=2.0})=>{
            if(!text)return null;
            const clean=cleanText(text);
            const paras=clean.split(/\n\n+/).filter(p=>p.trim());
            if(paras.length<=1)return <p style={{fontSize:size,lineHeight:lh,color,margin:0,whiteSpace:'pre-wrap'}}>{clean}</p>;
            return(<>{paras.map((p,i)=><p key={i} style={{fontSize:size,lineHeight:lh,color,margin:0,marginBottom:i<paras.length-1?'14px':'0'}}>{p.trim()}</p>)}</>);
          };
 
          // ── 섹션 헤더 ──
          const SHdr=({num,title,accent,sub})=>(
            <div style={{marginBottom:'18px',marginTop:'8px'}}>
              <div style={{display:'flex',alignItems:'center',gap:'11px',marginBottom:'5px'}}>
                <div style={{width:'30px',height:'30px',borderRadius:'50%',background:'linear-gradient(135deg,'+accent+'55,'+accent+'22)',border:'1.5px solid '+accent+'99',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'12px',fontWeight:900,color:accent,flexShrink:0,boxShadow:'0 0 8px '+accent+'33'}}>{num}</div>
                <div style={{fontSize:'14pt',fontWeight:900,color:'#fff',letterSpacing:'-0.4px',lineHeight:1.2}}>{title}</div>
              </div>
              {sub&&<div style={{fontSize:'11px',color:'rgba(255,255,255,0.32)',paddingLeft:'41px',marginBottom:'6px'}}>{sub}</div>}
              <div style={{height:'1.5px',background:`linear-gradient(90deg,${accent}88,${accent}22,transparent)`,marginTop:'4px',borderRadius:'1px'}}/>
            </div>
          );
 
          // ── TCard 기본 ──
          const TCard=({text,accent})=>(
            <div style={{background:'rgba(0,0,0,0.12)',border:`1px solid ${accent}18`,borderLeft:`3px solid ${accent}77`,borderRadius:'0 14px 14px 0',padding:'18px 20px 18px 22px',marginBottom:'28px'}}>
              <Paras text={text} color="rgba(255,255,255,0.82)" size="11pt" lh={2.05}/>
            </div>
          );
 
          // ── S1 선언 카드 ──
          const S1Card=({text})=>{
            const clean=text?.replace(/===S1START===[\s\S]*?===S1END===/,'').trim()||'';
            return(
              <div style={{background:'linear-gradient(145deg,rgba(106,27,154,0.18),rgba(13,0,32,0.5))',border:'1.5px solid rgba(206,147,216,0.28)',borderRadius:'16px',padding:'22px 20px',marginBottom:'28px'}}>
                {S1_HEADLINE&&<div style={{fontSize:'clamp(16px,4.5vw,21px)',fontWeight:900,color:'#CE93D8',lineHeight:1.45,marginBottom:'16px',textAlign:'center',padding:'0 6px',letterSpacing:'-0.3px'}}>{S1_HEADLINE}</div>}
                <div style={{height:'1px',background:'linear-gradient(90deg,transparent,rgba(206,147,216,0.3),transparent)',marginBottom:'16px'}}/>
                <Paras text={clean} color="rgba(255,255,255,0.82)" size="11pt" lh={2.05}/>
              </div>
            );
          };
 
          // ── S2 카드: 성장환경 4파트 ──
          const S2Card=({text})=>{
            if(!text)return<TCard text={text} accent="#F48FB1"/>;
            const labels=['성장환경','패턴 형성','처음의 기능','지금도 작동'];
            const icons=['🌱','🔗','🛡','🔄'];
            const colors=['rgba(144,202,249,0.75)','rgba(206,147,216,0.75)','rgba(255,183,77,0.75)','rgba(255,138,101,0.75)'];
            // 첫째/둘째/셋째/넷째 또는 순서 번호로 파트 분리
            const splitRe=/(?:^|\n)\s*(?:첫째|둘째|셋째|넷째)[.。\s]/gm;
            const idxs=[];let m2;const re2=/(?:^|\n)\s*(?:첫째|둘째|셋째|넷째)[.。\s]/gm;
            while((m2=re2.exec(text))!==null)idxs.push(m2.index+(m2[0].startsWith('\n')?1:0));
            if(idxs.length>=3){
              const parts=idxs.map((idx,i)=>{
                const end=idxs[i+1]??text.length;
                return text.slice(idx,end).replace(/^(?:첫째|둘째|셋째|넷째)[.。\s]*/,'').trim();
              });
              return(
                <div style={{marginBottom:'28px'}}>
                  {parts.map((p,i)=>(
                    <div key={i} style={{background:'rgba(0,0,0,0.15)',border:`1px solid ${colors[i]||'rgba(255,255,255,0.06)'}33`,borderRadius:'12px',padding:'15px 17px',marginBottom:'10px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'10px'}}>
                        <span style={{fontSize:'14px'}}>{icons[i]}</span>
                        <span style={{fontSize:'9px',fontWeight:700,color:colors[i],letterSpacing:'2px',textTransform:'uppercase'}}>{labels[i]}</span>
                      </div>
                      <Paras text={p} color="rgba(255,255,255,0.82)" size="11pt" lh={2.0}/>
                    </div>
                  ))}
                </div>
              );
            }
            return<TCard text={text} accent="#F48FB1"/>;
          };
 
          // ── S3 카드: 4개 관계 장면 ──
          const S3Card=({text})=>{
            if(!text)return<TCard text={text} accent="#80DEEA"/>;
            const SCENE_DEFS=[
              {key:'연인',label:'연인 관계',color:'#F48FB1',icon:'♡'},
              {key:'친구',label:'친구 관계',color:'#80DEEA',icon:'◎'},
              {key:'직장',label:'직장·사회',color:'#A5D6A7',icon:'◈'},
              {key:'혼자',label:'혼자 있을 때',color:'#CE93D8',icon:'◇'},
            ];
            // 장면 헤더 탐지: "연인 관계", "[연인 관계]", "A. 연인", "장면 A — 연인" 등
            const detectScene=(line)=>SCENE_DEFS.find(d=>line.includes(d.key)&&line.length<40);
            const lines=text.split('\n');
            const scenes=[];let cur=null;
            lines.forEach(line=>{
              const def=detectScene(line);
              if(def){if(cur)scenes.push(cur);cur={...def,body:[]};}
              else if(cur){cur.body.push(line);}
            });
            if(cur)scenes.push(cur);
            if(scenes.length<2)return<TCard text={text} accent="#80DEEA"/>;
            const SUB_LABELS=['상황','자동반응','내면','내면의 독백','상대방이 느끼는 것','핵심 발견','소름 포인트'];
            const isHighlight=(l)=>l.includes('핵심 발견')||l.includes('소름 포인트');
            const parseSubItems=(bodyLines)=>{
              const items=[];let curSub=null;
              bodyLines.forEach(line=>{
                const found=SUB_LABELS.find(sl=>line.match(new RegExp('^'+sl.replace('·','[·]')+'[：:：]?\\s*')));
                if(found){
                  if(curSub)items.push(curSub);
                  const body=line.replace(new RegExp('^'+found.replace('·','[·]')+'[：:：]?\\s*'),'').trim();
                  curSub={label:found,body,highlight:isHighlight(found)};
                } else if(curSub){curSub.body+=(curSub.body?'\n':'')+line;}
                else if(line.trim())items.push({label:'',body:line.trim(),highlight:false});
              });
              if(curSub)items.push(curSub);
              return items;
            };
            return(
              <div style={{marginBottom:'28px'}}>
                {scenes.map((sc,i)=>{
                  const bodyLines=sc.body.join('\n').replace(/—?\s*\[장면\s*\d+[.\]]/g,'').split('\n');
                  const subs=parseSubItems(bodyLines.filter(l=>l.trim()));
                  return(
                    <div key={i} style={{background:'rgba(0,0,0,0.15)',border:`1px solid ${sc.color}22`,borderRadius:'13px',overflow:'hidden',marginBottom:'14px'}}>
                      <div style={{background:`linear-gradient(90deg,${sc.color}22,transparent)`,borderBottom:`1px solid ${sc.color}18`,padding:'10px 16px',display:'flex',alignItems:'center',gap:'9px'}}>
                        <span style={{fontSize:'14px',color:sc.color}}>{sc.icon}</span>
                        <span style={{fontSize:'11px',fontWeight:800,color:sc.color,letterSpacing:'1.5px',textTransform:'uppercase'}}>{sc.label}</span>
                      </div>
                      <div style={{padding:'14px 16px'}}>
                        {subs.length>1?subs.map((sub,j)=>sub.body&&(
                          <div key={j} style={{marginBottom:'10px',paddingBottom:j<subs.length-2?'10px':'0',borderBottom:j<subs.length-2?'1px solid rgba(255,255,255,0.05)':'none'}}>
                            {sub.label&&<div style={{fontSize:'9px',color:sub.highlight?sc.color:'rgba(255,255,255,0.32)',fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'5px'}}>{sub.label}</div>}
                            <div style={{fontSize:sub.highlight?'12pt':'10.5pt',lineHeight:1.95,color:sub.highlight?'rgba(255,255,255,0.92)':'rgba(255,255,255,0.75)',fontWeight:sub.highlight?700:400}}>{cleanText(sub.body)}</div>
                          </div>
                        )):<Paras text={bodyLines.join('\n')} color="rgba(255,255,255,0.8)" size="10.5pt" lh={1.95}/>}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          };
 
          // ── S4 카드: 발견+연쇄+역설+이득 ──
          const S4Card=({text})=>{
            if(!text)return<TCard text={text} accent="#FFD54F"/>;
            // 발견 N 파싱 — 다양한 포맷 처리
            const findRe=/발견\s*(\d+)\s*[—\-.：:]\s*([^\n]+)([\s\S]*?)(?=발견\s*\d+|패턴\s*연쇄|역설|기능적?\s*이득|$)/g;
            const findings=[...text.matchAll(/발견\s*(\d+)\s*[—\-.：:]\s*([^\n]+)([\s\S]*?)(?=발견\s*\d+|패턴\s*연쇄|역설|기능적?\s*이득|$)/g)];
            const chainM=text.match(/패턴\s*연쇄\s*구조?\n?([\s\S]*?)(?=역설|기능적?\s*이득|$)/);
            const paradoxM=text.match(/역설\n?([\s\S]*?)(?=기능적?\s*이득|$)/);
            const gainsM=text.match(/기능적?\s*이득\n?([\s\S]*?)$/);
            if(findings.length===0&&!chainM)return<TCard text={text} accent="#FFD54F"/>;
            const fColors=['#CE93D8','#F48FB1','#80DEEA'];
            return(
              <div style={{marginBottom:'28px'}}>
                {findings.map((f,i)=>(
                  <div key={i} style={{background:'rgba(0,0,0,0.18)',border:`1px solid ${fColors[i]||'rgba(255,255,255,0.08)'}33`,borderRadius:'13px',padding:'16px 18px',marginBottom:'12px'}}>
                    <div style={{display:'flex',alignItems:'center',gap:'9px',marginBottom:'10px'}}>
                      <div style={{width:'22px',height:'22px',borderRadius:'50%',background:fColors[i]+'33',border:`1.5px solid ${fColors[i]}66`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:900,color:fColors[i],flexShrink:0}}>{f[1]}</div>
                      <span style={{fontSize:'12px',fontWeight:800,color:fColors[i]}}>발견 {f[1]} — {f[2].trim()}</span>
                    </div>
                    <Paras text={f[3].trim()} color="rgba(255,255,255,0.8)" size="11pt" lh={2.0}/>
                  </div>
                ))}
                {chainM&&chainM[1].trim()&&(
                  <div style={{background:'rgba(255,213,79,0.05)',border:'1px solid rgba(255,213,79,0.2)',borderRadius:'12px',padding:'15px 17px',marginBottom:'12px'}}>
                    <div style={{fontSize:'9px',color:'#FFD54F',fontWeight:700,letterSpacing:'2.5px',textTransform:'uppercase',marginBottom:'10px'}}>패턴 연쇄</div>
                    <Paras text={chainM[1].trim()} color="rgba(255,255,255,0.8)" size="11pt" lh={2.0}/>
                  </div>
                )}
                {paradoxM&&paradoxM[1].trim()&&(
                  <div style={{background:'rgba(13,0,32,0.6)',border:'1px solid rgba(206,147,216,0.25)',borderRadius:'12px',padding:'15px 17px',marginBottom:'12px'}}>
                    <div style={{fontSize:'9px',color:'rgba(206,147,216,0.7)',fontWeight:700,letterSpacing:'2.5px',textTransform:'uppercase',marginBottom:'10px'}}>핵심 역설</div>
                    <Paras text={paradoxM[1].trim()} color="rgba(255,255,255,0.82)" size="11pt" lh={2.0}/>
                  </div>
                )}
                {gainsM&&gainsM[1].trim()&&(()=>{
                  const gt=gainsM[1].trim();
                  const giveM=gt.match(/(?:주는\s*것|이\s*패턴이\s*주는)([\s\S]*?)(?=빼앗|$)/);
                  const takeM=gt.match(/(?:빼앗는\s*것|이\s*패턴이\s*빼앗)([\s\S]*?)$/);
                  return(
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                      <div style={{background:'rgba(102,187,106,0.06)',border:'1px solid rgba(102,187,106,0.18)',borderRadius:'11px',padding:'13px 14px'}}>
                        <div style={{fontSize:'9px',color:'#66BB6A',fontWeight:700,letterSpacing:'2px',marginBottom:'9px'}}>이 패턴이 주는 것</div>
                        <Paras text={giveM?giveM[1].trim():gt} color="rgba(255,255,255,0.75)" size="10pt" lh={1.85}/>
                      </div>
                      <div style={{background:'rgba(239,83,80,0.06)',border:'1px solid rgba(239,83,80,0.18)',borderRadius:'11px',padding:'13px 14px'}}>
                        <div style={{fontSize:'9px',color:'#EF5350',fontWeight:700,letterSpacing:'2px',marginBottom:'9px'}}>이 패턴이 빼앗는 것</div>
                        <Paras text={takeM?takeM[1].trim():''} color="rgba(255,255,255,0.75)" size="10pt" lh={1.85}/>
                      </div>
                    </div>
                  );
                })()}
              </div>
            );
          };
 
          // ── S5 미래 두 갈래 카드 ──
          const FutureCard=({text})=>{
            if(!text)return null;
            const m=text.match(/\n\s*(바꿀 때)/);
            const splitIdx=m?text.indexOf(m[0]):-1;
            const part1=splitIdx>0?text.slice(0,splitIdx).trim():text;
            const part2=splitIdx>0?text.slice(splitIdx).trim():'';
            const YrBadge=({yr,color})=>(
              <div style={{display:'inline-flex',alignItems:'center',background:color+'22',border:'1px solid '+color+'44',borderRadius:'6px',padding:'2px 9px',fontSize:'9px',fontWeight:700,color,letterSpacing:'1px',marginBottom:'7px'}}>{yr}</div>
            );
            const renderPart=(t,isChange)=>{
              const clean=t.replace(/^(?:바꾸지 않을 때|바꿀 때)\s*\n?/,'').trim();
              const segments=clean.split(/\n(?=(?:3년|5년|10년)\s*후?)/);
              if(segments.length>1){
                return segments.map((seg,i)=>{
                  const yrM=seg.match(/^((?:3년|5년|10년)\s*후?)\s*\n?/);
                  const yr=yrM?yrM[1]:'';
                  const body=yrM?seg.replace(yrM[0],'').trim():seg.trim();
                  const color=isChange?'#66BB6A':'#EF5350';
                  return(<div key={i} style={{marginBottom:'14px'}}>{yr&&<YrBadge yr={yr} color={color}/>}<Paras text={body} lh={1.95} color="rgba(255,255,255,0.8)"/></div>);
                });
              }
              return<Paras text={clean} lh={1.95} color="rgba(255,255,255,0.8)"/>;
            };
            return(
              <div style={{marginBottom:'28px'}}>
                <div style={{background:'rgba(239,83,80,0.06)',border:'1px solid rgba(239,83,80,0.18)',borderLeft:'3px solid #EF5350',borderRadius:'0 14px 14px 0',padding:'18px 20px 18px 22px',marginBottom:'10px'}}>
                  <div style={{fontSize:'9px',color:'#EF5350',fontWeight:700,letterSpacing:'3px',textTransform:'uppercase',marginBottom:'14px'}}>바꾸지 않을 때</div>
                  {renderPart(part1,false)}
                </div>
                {part2&&(
                  <div style={{background:'rgba(102,187,106,0.06)',border:'1px solid rgba(102,187,106,0.18)',borderLeft:'3px solid #66BB6A',borderRadius:'0 14px 14px 0',padding:'18px 20px 18px 22px'}}>
                    <div style={{fontSize:'9px',color:'#66BB6A',fontWeight:700,letterSpacing:'3px',textTransform:'uppercase',marginBottom:'14px'}}>바꿀 때</div>
                    {renderPart(part2,true)}
                    <div style={{marginTop:'14px',paddingTop:'12px',borderTop:'1px solid rgba(102,187,106,0.15)',fontSize:'11px',color:'rgba(102,187,106,0.7)',fontStyle:'italic',lineHeight:1.8}}>지금 이 리포트를 읽고 있다는 것이 — 이미 그 방향이에요.</div>
                  </div>
                )}
              </div>
            );
          };
 
          // ── S6 처방 카드 (디자인 전면 적용) ──
          const RxCard=({text})=>{
            if(!text)return null;
            // 처방 N 줄 시작 분리 — N — / N. / N: 모두 처리
            const rxLines=text.split('\n');
            const sections=[];let cur=null;
            rxLines.forEach(line=>{
              const m=line.match(/^처방\s*(\d+)\s*[—\-.：:]\s*(.*)/);
              if(m){if(cur)sections.push(cur);cur={num:m[1],title:m[2].trim(),body:[]};}
              else if(cur){cur.body.push(line);}
            });
            if(cur)sections.push(cur);
            // 서브항목 파싱 (왜/어떻게/주의/1주일 후)
            const SUB=[
              {key:'왜',color:'rgba(206,147,216,0.8)',bg:'rgba(206,147,216,0.06)'},
              {key:'어떻게',color:'rgba(255,255,255,0.88)',bg:'rgba(255,255,255,0.04)'},
              {key:'주의',color:'rgba(255,183,77,0.85)',bg:'rgba(255,183,77,0.06)'},
              {key:'1주일 후',color:'rgba(165,214,167,0.85)',bg:'rgba(165,214,167,0.06)'},
            ];
            const parseBody=(bodyLines)=>{
              const items=[];let curSub=null;
              bodyLines.forEach(line=>{
                const found=SUB.find(s=>line.match(new RegExp('^(?:→\\s*)?(?:'+s.key+'|왜:|어떻게:|주의:|1주일\\s*후:)[：:：]?\\s*')));
                if(found){
                  if(curSub)items.push(curSub);
                  const body=line.replace(new RegExp('^(?:→\\s*)?(?:'+found.key+'[^:：]*)[：:：]?\\s*'),'').trim();
                  curSub={...found,body};
                } else if(curSub){curSub.body+=(curSub.body?'\n':'')+line;}
              });
              if(curSub)items.push(curSub);
              return items;
            };
            if(sections.length===0)return<TCard text={text} accent="#A5D6A7"/>;
            // 개인처방과 관계처방 분리
            const personalSecs=sections.filter(s=>parseInt(s.num)<=4);
            const relSecs=sections.filter(s=>parseInt(s.num)>4);
            return(
              <div style={{marginBottom:'28px'}}>
                {personalSecs.map((sec,i)=>{
                  const subs=parseBody(sec.body);
                  return(
                    <div key={i} style={{background:'rgba(0,0,0,0.15)',border:'1px solid rgba(165,214,167,0.14)',borderRadius:'13px',padding:'16px 18px',marginBottom:'14px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'14px'}}>
                        <div style={{width:'26px',height:'26px',background:'linear-gradient(135deg,#1B5E20,#2E7D32)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'11px',fontWeight:900,color:'#fff',flexShrink:0}}>{sec.num}</div>
                        <div style={{fontSize:'12.5px',fontWeight:800,color:'#A5D6A7',letterSpacing:'-0.2px'}}>{sec.title}</div>
                      </div>
                      {subs.length>=2?subs.map((sub,j)=>sub.body.trim()&&(
                        <div key={j} style={{background:sub.bg,borderRadius:'8px',padding:'10px 12px',marginBottom:'8px'}}>
                          <div style={{fontSize:'9px',color:sub.color,fontWeight:700,letterSpacing:'1.5px',textTransform:'uppercase',marginBottom:'6px'}}>{sub.key}</div>
                          <div style={{fontSize:'11pt',lineHeight:1.9,color:sub.color,whiteSpace:'pre-wrap'}}>{sub.body.trim()}</div>
                        </div>
                      )):<Paras text={sec.body.join('\n')} color="rgba(255,255,255,0.75)" size="10.5pt" lh={1.95}/>}
                    </div>
                  );
                })}
                {relSecs.length>0&&(
                  <div style={{marginTop:'16px'}}>
                    <div style={{fontSize:'9px',color:'rgba(165,214,167,0.6)',fontWeight:700,letterSpacing:'3px',textTransform:'uppercase',marginBottom:'12px'}}>관계별 처방</div>
                    {relSecs.map((sec,i)=>(
                      <div key={i} style={{background:'rgba(165,214,167,0.05)',border:'1px solid rgba(165,214,167,0.14)',borderRadius:'11px',padding:'13px 15px',marginBottom:'9px'}}>
                        <div style={{fontSize:'10px',color:'#A5D6A7',fontWeight:700,marginBottom:'6px'}}>{sec.title}</div>
                        <Paras text={sec.body.join('\n').trim()} color="rgba(255,255,255,0.75)" size="10.5pt" lh={1.9}/>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          };
 
          // ── S7 21일 플랜 ──
          const PlanCard=({text})=>{
            if(!text)return null;
            const lines2=text.split('\n');
            const intro2=[];const dayItems2=[];let curDay2=null;
            lines2.forEach(line=>{
              const m=line.match(/^(Day\s*\d+)\s*[.\s]?(.*)/i);
              if(m){if(curDay2)dayItems2.push(curDay2);const n=parseInt(m[1].replace(/\D/g,''));curDay2={num:n,label:m[1].trim(),body:m[2].trim()};}
              else if(curDay2){curDay2.body+=(curDay2.body?'\n':'')+line;}
              else{intro2.push(line);}
            });
            if(curDay2)dayItems2.push(curDay2);
            const ws=(n)=>{
              if(n<=7)return{bg:'rgba(106,27,154,0.10)',border:'rgba(206,147,216,0.18)',dot:'#CE93D8',wk:'1주차 — 인식'};
              if(n<=14)return{bg:'rgba(13,71,161,0.10)',border:'rgba(144,202,249,0.18)',dot:'#90CAF9',wk:'2주차 — 개입'};
              return{bg:'rgba(27,94,32,0.10)',border:'rgba(165,214,167,0.18)',dot:'#A5D6A7',wk:'3주차 — 재조정'};
            };
            const shown={1:false,2:false,3:false};
            return(
              <div style={{marginBottom:'28px'}}>
                {intro2.filter(l=>l.trim()).length>0&&(
                  <div style={{background:'rgba(206,147,216,0.07)',border:'1px solid rgba(206,147,216,0.14)',borderRadius:'11px',padding:'14px 16px',marginBottom:'16px'}}>
                    <Paras text={intro2.join('\n').trim()} color="rgba(255,255,255,0.7)" size="11pt" lh={1.95}/>
                  </div>
                )}
                {dayItems2.length>0?dayItems2.map((day,i)=>{
                  const w=ws(day.num);const wk=day.num<=7?1:day.num<=14?2:3;
                  const showWk=!shown[wk];if(showWk)shown[wk]=true;
                  return(
                    <div key={i}>
                      {showWk&&<div style={{display:'flex',alignItems:'center',gap:'10px',margin:'16px 0 8px'}}><div style={{fontSize:'9px',fontWeight:700,color:w.dot,letterSpacing:'3px',textTransform:'uppercase'}}>{w.wk}</div><div style={{flex:1,height:'1px',background:w.dot+'33'}}/></div>}
                      <div style={{background:w.bg,border:`1px solid ${w.border}`,borderRadius:'10px',padding:'11px 14px',marginBottom:'6px',display:'flex',gap:'12px',alignItems:'flex-start'}}>
                        <div style={{minWidth:'46px',flexShrink:0}}><div style={{fontSize:'8px',fontWeight:800,color:w.dot,letterSpacing:'1px'}}>{day.label.toUpperCase()}</div></div>
                        <div style={{fontSize:'11pt',lineHeight:1.9,color:'rgba(255,255,255,0.82)',flex:1}}>{cleanText(day.body).trim()}</div>
                      </div>
                    </div>
                  );
                }):<Paras text={text} color="rgba(255,255,255,0.75)" size="11pt" lh={2.0}/>}
              </div>
            );
          };
 
return(
            <div>
              {/* 헤더 */}
              <div style={{textAlign:'center',marginBottom:'22px',paddingTop:'8px'}}>
                <div style={{...LBL,color:'#CE93D8',marginBottom:'10px'}}>심리 독립 프로젝트 · 전체 분석</div>
                <div style={{fontSize:'clamp(19px,5vw,23px)',fontWeight:900,color:'#fff',letterSpacing:'-0.5px',lineHeight:1.25,marginBottom:'8px'}}>{ptn.name}</div>
                <div style={{fontSize:'12px',color:'rgba(255,255,255,0.45)',marginBottom:'10px'}}>{ptn.sub}</div>
                <div style={{display:'inline-flex',alignItems:'center',gap:'6px',background:ti.bg,border:'1px solid '+ti.border+'50',borderRadius:'8px',padding:'4px 12px'}}>
                  <span style={{color:ti.color,fontWeight:900}}>{ti.symbol}</span>
                  <span style={{fontSize:'11px',fontWeight:700,color:ti.color}}>{ti.type} — {ti.detail}</span>
                </div>
              </div>
 
              {s1&&(<div><SHdr num="1" title="당신을 한 문장으로 읽는다" accent="#CE93D8" sub="이 패턴 이름이 붙은 이유"/><S1Card text={s1}/></div>)}
              {s2&&(<div><SHdr num="2" title="이 패턴이 어디서 왔는가" accent="#F48FB1" sub="성장환경 · 패턴 형성 · 초기 기능 · 지금도 작동"/><S2Card text={s2}/></div>)}
              {s3&&(<div><SHdr num="3" title="지금 삶에서 이렇게 작동한다" accent="#80DEEA" sub="연인 · 친구 · 직장 · 혼자 — 4개 장면"/><S3Card text={s3}/></div>)}
              {s4&&(<div><SHdr num="4" title="당신도 몰랐던 구조" accent="#FFD54F" sub="발견 3가지 · 패턴 연쇄 · 역설 · 기능이득"/><S4Card text={s4}/></div>)}
              {!s4&&<div style={{background:'rgba(255,213,79,0.05)',border:'1px solid rgba(255,213,79,0.12)',borderRadius:'13px',padding:'16px',marginBottom:'28px',textAlign:'center'}}><div style={{fontSize:'11px',color:'rgba(255,213,79,0.5)',marginBottom:'8px'}}>섹션 4 — 당신도 몰랐던 구조</div><div style={{fontSize:'11px',color:'rgba(255,255,255,0.3)'}}>분석 생성 중 오류가 발생했어요. 페이지를 새로고침하면 다시 시도합니다.</div></div>}
              {s5&&(<div><SHdr num="5" title="10년 후 이 패턴은 어디로 가는가" accent="#EF5350" sub="바꾸지 않을 때 vs 바꿀 때 — 두 갈래 미래"/><FutureCard text={s5}/></div>)}
              {s6&&(<div><SHdr num="6" title="이 패턴에만 작동하는 처방" accent="#A5D6A7" sub="개인 처방 4개 · 관계별 처방 4개"/><RxCard text={s6}/></div>)}
              {s7&&(<div><SHdr num="7" title="21일 플랜" accent="#CE93D8" sub="인식 → 개입 → 재조정"/><PlanCard text={s7}/></div>)}
 
              {s8&&(
                <div style={{background:'linear-gradient(155deg,#0D0020,#1A0535,#2D1060)',border:'1px solid rgba(206,147,216,0.25)',borderRadius:'16px',padding:'22px 18px',marginBottom:'22px'}}>
                  <div style={{fontSize:'9px',letterSpacing:'4px',color:'rgba(206,147,216,0.55)',textTransform:'uppercase',marginBottom:'14px'}}>라온단미의 편지</div>
                  <div style={{fontSize:'11pt',lineHeight:2.25,color:'rgba(255,255,255,0.85)',whiteSpace:'pre-wrap'}}>{s8}</div>
                  <div style={{width:'40px',height:'1px',background:'rgba(206,147,216,0.25)',margin:'18px 0 12px'}}/>
                  <div style={{fontSize:'10pt',color:'rgba(255,255,255,0.38)',fontStyle:'italic'}}>라온단미 드림</div>
                </div>
              )}
 
              <div style={{background:'rgba(255,255,255,0.04)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:'12px',padding:'16px',marginBottom:'14px',textAlign:'center'}}>
                <div style={{fontSize:'12px',color:'rgba(255,255,255,0.45)',marginBottom:'10px',lineHeight:1.7}}>이 분석을 저장하고 싶다면 PDF로 저장해두세요</div>
                <button onClick={()=>window.print()} style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'10px',padding:'11px 24px',color:'#fff',fontSize:'13px',cursor:'pointer',fontWeight:600}}>
                  PDF로 저장하기
                </button>
              </div>
 
              <button style={GHOST} className="no-print" onClick={()=>setSc(SC.RESULT)}>← 무료 결과로</button>
              <BizFtr go={goLegal}/>
            </div>
          );
        })()}
 
        {/* ══ 법적 페이지 ══ */}
        {sc===SC.PRIVACY&&(<Legal title="개인정보처리방침" onBack={backLegal}><p>라온단미는 이용자의 개인정보를 중요시하며 「개인정보 보호법」에 따라 처리합니다.</p><br/><p><strong>1. 수집 항목</strong><br/>이메일 주소, 닉네임(선택), 테스트 응답 데이터</p><p><strong>2. 수집 목적</strong><br/>테스트 결과 발송, 서비스 이행, 마케팅 정보 제공(동의 시)</p><p><strong>3. 보유 기간</strong><br/>서비스 이용 종료 또는 동의 철회 시까지. 거래 기록은 5년 보관.</p><p><strong>4. 제3자 제공</strong><br/>동의 없이 제3자에게 제공하지 않습니다.</p><p><strong>5. 책임자</strong><br/>이메일: {BIZ.email}</p><p style={{fontSize:'11px',marginTop:'9px'}}>시행일: 2026년 1월 1일</p></Legal>)}
        {sc===SC.REFUND&&(<Legal title="환불 및 취소 정책" onBack={backLegal}><p>디지털 콘텐츠 특성상 분석 생성 후 환불이 제한됩니다.</p><br/><p><strong>분석 리포트 ({PRICE})</strong><br/>- 분석 생성 전: 전액 환불<br/>- 생성 후: 환불 불가<br/>- 당사 귀책 사유: 전액 환불</p><br/><p><strong>환불 신청</strong><br/>{BIZ.email}으로 주문 정보와 함께 신청 시 영업일 3일 이내 처리합니다.</p><p style={{fontSize:'11px',marginTop:'9px'}}>시행일: 2026년 1월 1일</p></Legal>)}
        {sc===SC.TERMS&&(<Legal title="이용약관" onBack={backLegal}><p><strong>제1조 목적</strong><br/>라온단미가 제공하는 심리 독립 테스트 및 관련 서비스 이용에 관한 조건을 규정합니다.</p><br/><p><strong>제2조 서비스의 성격</strong><br/>본 서비스는 자기계발 목적 콘텐츠로, 전문 심리상담·의료 진단·치료 행위가 아닙니다.</p><br/><p><strong>제3조 저작권</strong><br/>모든 콘텐츠의 저작권은 라온단미에 귀속됩니다.</p><br/><p><strong>제4조 사업자 정보</strong><br/>상호: {BIZ.name} / 대표: {BIZ.rep} / 사업자번호: {BIZ.regNo}<br/>주소: {BIZ.addr}</p><p style={{fontSize:'11px',marginTop:'9px'}}>시행일: 2026년 1월 1일</p></Legal>)}
      </div>
    </div>
  );
}

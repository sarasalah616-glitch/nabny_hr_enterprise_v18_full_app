export function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000, toRad = v => (Number(v) * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));
}
const r=n=>Math.round(Number(n||0)*100)/100;
const toDate=s=>{const d=new Date(s+'T00:00:00');return isNaN(d)?null:d};
export function daysInMonth(period){const[y,m]=String(period).split('-').map(Number);return new Date(y,m,0).getDate()}
export function workingDaysInPeriod({period,joinDate,weekdays=[0,1,2,3,4],endDate}){
  if(!period)return 0;
  const[y,m]=period.split('-').map(Number), startMonth=new Date(y,m-1,1), end=new Date(y,m,0);
  const join=toDate(joinDate); let start=startMonth;
  if(join && join>start) start=join;
  if(endDate){const ed=toDate(endDate); if(ed && ed<end) end.setTime(ed.getTime())}
  if(start>end)return 0;
  const set=new Set((weekdays||[]).map(Number)); let count=0;
  for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){ if(set.has(d.getDay())) count++; }
  return count;
}
export function calcDelayMinutes(checkIn, graceEnd){
  if(!checkIn||!graceEnd)return 0;
  const [h1,m1]=checkIn.split(':').map(Number), [h2,m2]=graceEnd.split(':').map(Number);
  return Math.max(0,(h1*60+m1)-(h2*60+m2));
}
export function calculatePayroll({basicSalary=0,housing=0,transport=0,presentDays=0,workingDays=26,lateMinutes=0,overtimeHours=0,overtimeRate=1.5,divisionDays=30}) {
  const basic=Number(basicSalary||0), div=Math.max(1,Number(divisionDays||30));
  const dayRate=basic/div, hourRate=dayRate/8, minuteRate=hourRate/60;
  const absentDays=Math.max(0,Number(workingDays)-Number(presentDays));
  const absenceDeduction=absentDays*dayRate, lateDeduction=Number(lateMinutes||0)*minuteRate;
  const overtimeAmount=Number(overtimeHours||0)*hourRate*Number(overtimeRate||1.5);
  const gross=basic+Number(housing||0)+Number(transport||0)+overtimeAmount;
  const net=Math.max(0,gross-absenceDeduction-lateDeduction);
  return {basic,housing:Number(housing||0),transport:Number(transport||0),presentDays:Number(presentDays||0),workingDays:Number(workingDays||0),divisionDays:div,dayRate:r(dayRate),absentDays,lateMinutes:Number(lateMinutes||0),overtimeHours:Number(overtimeHours||0),absenceDeduction:r(absenceDeduction),lateDeduction:r(lateDeduction),overtimeAmount:r(overtimeAmount),gross:r(gross),net:r(net)};
}

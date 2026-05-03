export function distanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000, toRad = v => (Number(v) * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1), dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
  return Math.round(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)));
}
export function calculatePayroll({basicSalary=0,housing=0,transport=0,presentDays=0,workingDays=26,lateMinutes=0,overtimeHours=0,overtimeRate=1.5}) {
  const basic=Number(basicSalary||0), dayRate=basic/30, hourRate=dayRate/8, minuteRate=hourRate/60;
  const absentDays=Math.max(0,Number(workingDays)-Number(presentDays));
  const absenceDeduction=absentDays*dayRate, lateDeduction=Number(lateMinutes||0)*minuteRate;
  const overtimeAmount=Number(overtimeHours||0)*hourRate*Number(overtimeRate||1.5);
  const gross=basic+Number(housing||0)+Number(transport||0)+overtimeAmount;
  const net=Math.max(0,gross-absenceDeduction-lateDeduction);
  const r=n=>Math.round(n*100)/100;
  return {basic,housing:Number(housing||0),transport:Number(transport||0),presentDays:Number(presentDays||0),absentDays,lateMinutes:Number(lateMinutes||0),overtimeHours:Number(overtimeHours||0),absenceDeduction:r(absenceDeduction),lateDeduction:r(lateDeduction),overtimeAmount:r(overtimeAmount),gross:r(gross),net:r(net)};
}

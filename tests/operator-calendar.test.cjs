const {test}=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');
const helpers=import('data:text/javascript;base64,'+fs.readFileSync('utils/operator-calendar.js').toString('base64'));
const interval=(start,end)=>({starts_at:'2098-01-06 '+start+':00',ends_at:'2098-01-06 '+end+':00'});
test('calendar free time respects breaks, adjacent reservations and overlapping bookings',async()=>{
 const {freeIntervals}=await helpers;
 const shifts=[interval('09:00','12:00'),interval('13:00','18:00')];
 assert.deepEqual(freeIntervals(shifts,[interval('10:00','11:00'),interval('11:00','14:00'),interval('13:30','15:00')]),[interval('09:00','10:00'),interval('15:00','18:00')]);
 assert.deepEqual(freeIntervals([],[]),[]);
 assert.deepEqual(freeIntervals(shifts,[interval('08:00','19:00')]),[]);
});
test('calendar weeks cross month boundaries and invalid dates do not crash',async()=>{
 const {weekDates}=await helpers;
 assert.deepEqual(weekDates('2026-11-01'),['2026-10-26','2026-10-27','2026-10-28','2026-10-29','2026-10-30','2026-10-31','2026-11-01']);
 assert.deepEqual(weekDates(''),[]);
});

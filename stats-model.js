/* Read-only analysis of retained logs. No timer expiry is treated as a user action. */
(function(root) {
  function analyze({logs, timers, names, directory = {}, now, days}) {
    const day = 86400000, cutoff = now - days * day;
    const manual = new Set(["check", "uncheck", "reset", "custom_timer"]);
    const stop = new Set(["uncheck", "reset"]);
    const valid = logs.filter(x => x && typeof x.id === "string" &&
      Number.isFinite(x.time) && x.time > 0 && x.time <= now &&
      manual.has(x.action) && !x.automated);
    const scoped = valid.filter(x => names.includes(x.boss || x.id.split("_").slice(1).join("_")));
    const period = scoped.filter(x => x.time >= cutoff);
    const users = new Map(Object.entries(directory).map(([uid,v]) =>
      [uid, {name:v.email || v.displayName || uid, count:0}]));
    const bossCounts = names.map(name => ({name, count:0, on:0, off:0, active:0, recent24:0}));
    const cells = [];
    for (const boss of bossCounts) {
      for (let ch=1; ch<=30; ch++) {
        const id = ch + "_" + boss.name;
        const history = scoped.filter(x => x.id === id).sort((a,b)=>b.time-a.time);
        const last = history[0]?.time || 0;
        const lastStop = history.find(x=>stop.has(x.action))?.time || 0;
        const active = timers[id]?.checked === true;
        // An old start or stop is evidence of observation, not proof logs were retained.
        const anchor = lastStop || history.find(x=>x.action==="check")?.time || 0;
        const suspicious = active && anchor > 0 && now-anchor >= day;
        const unknown = active && !anchor;
        const recent = history.filter(x=>x.time>=cutoff);
        const on = recent.filter(x=>x.action==="check").length;
        const off = recent.filter(x=>stop.has(x.action)).length;
        const recent24 = history.filter(x=>x.time>=now-day && (x.action==="check"||stop.has(x.action))).length;
        boss.count += recent.length; boss.on += on; boss.off += off;
        if(active) {boss.active++; boss.recent24 += recent24;}
        cells.push({id,boss:boss.name,ch,active,last,lastStop,anchor,suspicious,unknown,
          stale:last>0 && now-last>=day,on,off,count:recent.length,recent24});
      }
    }
    for(const x of period) {
      const key=x.userUid || x.userEmail || "unknown";
      if(!users.has(key)) users.set(key,{name:x.userEmail || x.userName || key,count:0});
      users.get(key).count++;
    }
    return {cells,bossCounts,users:[...users.values()],period,
      suspicious:cells.filter(x=>x.suspicious),
      unknown:cells.filter(x=>x.unknown),
      stale:cells.filter(x=>x.stale),
      missing:cells.filter(x=>!x.last),
      oldest:scoped.reduce((old,x)=>!old||x.time<old?x.time:old,0)};
  }
  root.BTStats = {analyze};
  if(typeof module!=="undefined") module.exports={analyze};
})(typeof window!=="undefined"?window:globalThis);

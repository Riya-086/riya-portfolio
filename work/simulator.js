// Interactive model of single-use refresh-token rotation, written for this portfolio.
// It mirrors the design described on the page. It is not production code.
(() => {
  const root = document.getElementById('sim');
  if (!root) return;
  const GRACE = 10;
  let S;
  const init = () => {
    S = { clock: 0, cookie: 't1', tokens: [{ id: 't1', usedAt: null, replacedBy: null }], revoked: false, next: 2,
          log: [{ tone: 'muted', text: 'Signed in. The browser cookie holds t1. Assume an attacker has also copied t1.' }] };
  };
  const spend = (id) => {
    const r = S.tokens.find((t) => t.id === id);
    if (!r || S.revoked) return { kind: 'invalid' };
    if (r.usedAt === null) {
      const s = 't' + S.next++;
      r.usedAt = S.clock; r.replacedBy = s;
      S.tokens.push({ id: s, usedAt: null, replacedBy: null });
      return { kind: 'rotated', successor: s };
    }
    const age = S.clock - r.usedAt;
    if (age <= GRACE && r.replacedBy) return { kind: 'grace', successor: r.replacedBy, age };
    S.revoked = true; S.cookie = null;
    return { kind: 'replay', age };
  };
  const say = (tone, text) => { S.log.unshift({ tone, text }); S.log = S.log.slice(0, 12); };
  const describe = (who, tok, o) => {
    if (o.kind === 'rotated') say('ok', `${who} presented ${tok}: rotated. It was spent and replaced by ${o.successor}.`);
    else if (o.kind === 'grace') say('warn', `${who} presented ${tok}, spent ${o.age} s ago: within the grace window, so it gets the same successor, ${o.successor}.`);
    else if (o.kind === 'replay') say('bad', `${who} presented ${tok}, spent ${o.age} s ago: replay. The whole token family is revoked and every tab must sign in again.`);
    else say('muted', `${who} presented ${tok}: rejected as invalid. Both cookies are cleared.`);
  };
  const noSession = () => say('muted', 'The browser has no session. Reset to sign in again.');
  const actions = {
    refresh() {
      if (!S.cookie) return noSession();
      const tok = S.cookie, o = spend(tok);
      if (o.kind === 'rotated' || o.kind === 'grace') S.cookie = o.successor; else S.cookie = null;
      describe('Tab A', tok, o);
    },
    race() {
      if (!S.cookie) return noSession();
      const tok = S.cookie, a = spend(tok), b = spend(tok);
      S.cookie = (b.kind === 'rotated' || b.kind === 'grace') ? b.successor : null;
      describe('Tab A', tok, a); describe('Tab B, at the same moment,', tok, b);
    },
    steal() { const o = spend('t1'); describe('The attacker', 't1', o); },
    wait() { S.clock += 15; say('muted', '15 seconds pass.'); },
    reset() { init(); },
  };
  const $ = (sel) => root.querySelector(sel);
  const render = () => {
    $('[data-out="cookie"]').textContent = S.cookie ?? 'none';
    $('[data-out="clock"]').textContent = S.clock + ' s';
    const session = $('[data-out="session"]');
    session.textContent = S.cookie ? 'Signed in' : S.revoked ? 'Family revoked, signed out' : 'Signed out';
    session.className = S.cookie ? 't-ok' : 't-bad';
    $('[data-out="tokens"]').innerHTML = S.tokens.map((t) => {
      const state = S.revoked ? 'revoked' : t.usedAt === null ? 'active' : 'spent';
      const cls = S.revoked ? 't-bad' : t.usedAt === null ? 't-ok' : 't-muted';
      return `<tr><td>${t.id}</td><td>${t.usedAt === null ? '\u2013' : t.usedAt + ' s'}</td><td>${t.replacedBy ?? '\u2013'}</td><td class="${cls}">${state}</td></tr>`;
    }).join('');
    $('[data-out="log"]').innerHTML = S.log.map((l) => `<li class="t-${l.tone}">${l.text}</li>`).join('');
  };
  root.querySelectorAll('[data-action]').forEach((btn) =>
    btn.addEventListener('click', () => { actions[btn.dataset.action](); render(); }));
  init(); render();
})();

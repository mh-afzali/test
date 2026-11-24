import { parseInline } from '../utils/markdown';

/**
 * اعتبارسنجی کامل worldData + characters + events.
 * خروجی: آرایه‌ای از { level, code, message, path, narrativeId?, sectionId?, blockIndex? }
 * level: 'error' | 'warning'
 */
export function validateAll(world, characters, events) {
  const issues = [];
  const add = (level, code, message, extra = {}) =>
    issues.push({ level, code, message, ...extra });

  if (!world?.world?.id) add('error', 'world_id_missing', 'world.id تعریف نشده است.');
  if (!Array.isArray(world?.continents)) {
    add('error', 'continents_missing', 'continents آرایه نیست.');
    return issues;
  }

  // مجموعه IDها و نام‌ها برای بررسی ارجاع‌ها
  const poiById = new Map();
  const poiByName = new Map();
  const narById = new Map();
  const charByName = new Map();
  const eventByName = new Map();
  const charById = new Map();
  const eventById = new Map();

  // === قاره‌ها و POIها و روایت‌ها ===
  for (const c of world.continents) {
    if (!c.id) add('error', 'continent_id_missing', `قاره «${c.name || '?'}» بدون id است.`);
    for (const p of c.pois || []) {
      if (!p.id) add('error', 'poi_id_missing', `POI «${p.name || '?'}» در قاره «${c.name}» بدون id است.`);
      if (poiById.has(p.id)) add('error', 'poi_duplicate', `POI تکراری با id «${p.id}».`);
      if (poiByName.has(p.name)) add('warning', 'poi_name_duplicate', `نام POI تکراری: «${p.name}» (ارجاع با نام مبهم می‌شود).`);
      poiById.set(p.id, p);
      poiByName.set(p.name, p);

      // بررسی infoVersions
      if (!Array.isArray(p.infoVersions) || p.infoVersions.length === 0) {
        add('error', 'poi_info_missing', `POI «${p.name}» هیچ infoVersions ندارد.`, { poiId: p.id });
      } else {
        validateVersions(p.infoVersions, `POI «${p.name}»`, add, { poiId: p.id });
      }

      // بررسی revealTime با infoVersions
      if (p.revealTime != null) {
        const minFrom = Math.min(...p.infoVersions.map((v) => v.from ?? 0));
        if (p.revealTime < minFrom) {
          add('warning', 'reveal_before_info',
            `POI «${p.name}»: revealTime=${p.revealTime} قبل از اولین infoVersion (from=${minFrom}) است؛ پیش از reveal هیچ متنی برای نمایش ندارد.`,
            { poiId: p.id });
        }
      }

      // روایت‌ها
      for (const n of p.narratives || []) {
        if (!n.id) add('error', 'narrative_id_missing', `روایت «${n.title || '?'}» در POI «${p.name}» بدون id است.`, { poiId: p.id });
        if (narById.has(n.id)) add('error', 'narrative_duplicate', `روایت تکراری با id «${n.id}».`, { narrativeId: n.id });
        narById.set(n.id, { narrative: n, poi: p, continent: c });

        validateNarrative(n, add, { poiId: p.id });
      }
    }
  }

  // === شخصیت‌ها ===
  for (const ch of characters || []) {
    if (!ch.id) add('error', 'char_id_missing', `شخصیت «${ch.name || '?'}» بدون id است.`);
    if (charById.has(ch.id)) add('error', 'char_duplicate', `شخصیت تکراری با id «${ch.id}».`);
    charById.set(ch.id, ch);
    if (ch.name) charByName.set(ch.name, ch);

    if (!Array.isArray(ch.versions) || ch.versions.length === 0) {
      add('error', 'char_versions_missing', `شخصیت «${ch.name}» هیچ versions ندارد.`, { characterId: ch.id });
    } else {
      validateVersions(ch.versions, `شخصیت «${ch.name}»`, add, { characterId: ch.id });
      for (const v of ch.versions) {
        if (v.locationId != null && !poiById.has(v.locationId)) {
          add('error', 'char_location_broken',
            `شخصیت «${ch.name}» به locationId ناموجود «${v.locationId}» ارجاع می‌دهد.`,
            { characterId: ch.id });
        }
      }
    }
  }

  // === رویدادها ===
  for (const ev of events || []) {
    if (!ev.id) add('error', 'event_id_missing', `رویداد «${ev.name || '?'}» بدون id است.`);
    if (eventById.has(ev.id)) add('error', 'event_duplicate', `رویداد تکراری با id «${ev.id}».`);
    eventById.set(ev.id, ev);
    if (ev.name) eventByName.set(ev.name, ev);

    if (ev.startTime != null && ev.endTime != null && ev.endTime < ev.startTime) {
      add('error', 'event_time_invalid',
        `رویداد «${ev.name}»: endTime (${ev.endTime}) قبل از startTime (${ev.startTime}) است.`,
        { eventId: ev.id });
    }

    for (const locId of ev.locationIds || []) {
      if (!poiById.has(locId)) {
        add('error', 'event_location_broken',
          `رویداد «${ev.name}» به locationId ناموجود «${locId}» ارجاع می‌دهد.`,
          { eventId: ev.id });
      }
    }

    for (const pId of ev.participants || []) {
      if (!charById.has(pId)) {
        add('error', 'event_participant_broken',
          `رویداد «${ev.name}» به participant ناموجود «${pId}» ارجاع می‌دهد.`,
          { eventId: ev.id });
      }
    }

    for (const relId of ev.relatedEvents || []) {
      if (!eventById.has(relId)) {
        add('error', 'event_related_broken',
          `رویداد «${ev.name}» به relatedEvent ناموجود «${relId}» ارجاع می‌دهد.`,
          { eventId: ev.id });
      }
    }

    if (Array.isArray(ev.versions) && ev.versions.length > 0) {
      validateVersions(ev.versions, `رویداد «${ev.name}»`, add, { eventId: ev.id });
    }
  }

  // === بررسی unlockهای story_read پس از پر شدن narById ===
  for (const [narId, entry] of narById) {
    const { narrative, poi } = entry;
    checkUnlockRefs(narrative.unlock, add, {
      narrativeId: narId,
      narById,
      poiName: poi.name,
    });

    // بررسی triggerTimeها خارج از بازه endTime
    for (const s of narrative.sections || []) {
      if (narrative.endTime != null && s.triggerTime > narrative.endTime) {
        add('warning', 'section_after_end',
          `روایت «${narrative.title}»: بخش «${s.id}» با triggerTime=${s.triggerTime} بعد از endTime روایت (${narrative.endTime}) است و هرگز دیده نمی‌شود.`,
          { narrativeId: narId, sectionId: s.id });
      }
    }
  }

  // === بررسی ارجاع‌های درون‌متنی در همه بلاک‌ها ===
  for (const [narId, entry] of narById) {
    const { narrative } = entry;
    for (const section of narrative.sections || []) {
      for (let bi = 0; bi < (section.content || []).length; bi++) {
        const block = section.content[bi];
        const textFields = getTextFields(block);
        for (const tf of textFields) {
          if (typeof tf !== 'string' || !tf.includes('[[')) continue;
          const tokens = parseInline(tf);
          for (const tok of tokens) {
            if (tok.type !== 'link') continue;
            if (!['poi', 'char', 'event'].includes(tok.kind)) {
              add('error', 'inline_kind_invalid',
                `نوع ارجاع نامعتبر «${tok.kind}» در روایت «${narrative.title}» (بخش ${section.id}, بلاک ${bi + 1}). فقط poi/char/event مجاز است.`,
                { narrativeId: narId, sectionId: section.id, blockIndex: bi });
              continue;
            }
            let exists = false;
            if (tok.kind === 'poi') exists = poiByName.has(tok.value);
            else if (tok.kind === 'char') exists = charByName.has(tok.value);
            else if (tok.kind === 'event') exists = eventByName.has(tok.value);
            if (!exists) {
              add('error', 'inline_target_missing',
                `ارجاع شکسته [[${tok.kind}:${tok.value}]] در روایت «${narrative.title}» (بخش ${section.id}, بلاک ${bi + 1}) — موجودیتی با این نام پیدا نشد.`,
                { narrativeId: narId, sectionId: section.id, blockIndex: bi });
            }
          }
        }
      }
    }
  }

  return issues;
}

/* ============================================================
   توابع کمکی (این‌ها قبلاً جا افتاده بودند)
   ============================================================ */

function getTextFields(block) {
  if (!block) return [];
  switch (block.type) {
    case 'text': return [block.value];
    case 'callout': return [block.value];
    case 'dialogue': return [block.value];
    case 'quote': return [block.value];
    case 'scene': return [block.value];
    default: return [];
  }
}

function validateVersions(versions, label, add, extra) {
  let prevTo = -Infinity;
  const sorted = [...versions].sort((a, b) => (a.from ?? 0) - (b.from ?? 0));
  for (const v of sorted) {
    if (v.from == null) add('error', 'version_from_missing', `${label}: یک version بدون from دارد.`, extra);
    if (v.to != null && v.from != null && v.to < v.from) {
      add('error', 'version_range_invalid',
        `${label}: یک version با to (${v.to}) قبل از from (${v.from}) دارد.`, extra);
    }
    if (v.from != null && v.from < prevTo) {
      add('warning', 'version_overlap',
        `${label}: بازه‌های زمانی versionها هم‌پوشانی دارند (from=${v.from} قبل از پایان نسخه قبلی).`, extra);
    }
    if (v.to != null) prevTo = Math.max(prevTo, v.to);
  }
}

function checkUnlockRefs(unlock, add, ctx) {
  if (!unlock) return;
  const { narrativeId, narById } = ctx;
  switch (unlock.type) {
    case 'time':
      if (typeof unlock.time !== 'number') {
        add('error', 'unlock_time_invalid', `unlock از نوع time ولی فیلد time عدد نیست (روایت ${narrativeId}).`, { narrativeId });
      }
      break;
    case 'story_read':
      if (!unlock.storyId) {
        add('error', 'unlock_story_missing', `unlock از نوع story_read ولی storyId خالی است (روایت ${narrativeId}).`, { narrativeId });
      } else if (!narById.has(unlock.storyId)) {
        add('error', 'unlock_story_broken',
          `unlock به storyId ناموجود «${unlock.storyId}» ارجاع می‌دهد (روایت ${narrativeId}).`,
          { narrativeId });
      }
      break;
    case 'all':
    case 'any':
      if (!Array.isArray(unlock.conditions) || unlock.conditions.length === 0) {
        add('error', 'unlock_conditions_empty', `unlock از نوع ${unlock.type} بدون conditions (روایت ${narrativeId}).`, { narrativeId });
      } else {
        for (const c of unlock.conditions) checkUnlockRefs(c, add, ctx);
      }
      break;
    case 'not':
      if (!unlock.condition) {
        add('error', 'unlock_not_missing', `unlock از نوع not بدون condition (روایت ${narrativeId}).`, { narrativeId });
      } else {
        checkUnlockRefs(unlock.condition, add, ctx);
      }
      break;
    default:
      add('error', 'unlock_type_invalid',
        `نوع unlock نامعتبر «${unlock.type}» (روایت ${narrativeId}).`, { narrativeId });
  }
}

/**
 * اعتبارسنجی سطح روایت (id، title، sections، unlock).
 * این تابع در validateAll صدا زده می‌شود.
 */
function validateNarrative(narrative, add, extra = {}) {
  const { poiId } = extra;
  const narLabel = `روایت «${narrative.title || narrative.id || '?'}»`;

  if (!narrative.id) {
    add('error', 'narrative_id_missing_inner', `${narLabel} بدون id است.`, { poiId });
  }
  if (!narrative.title) {
    add('warning', 'narrative_title_missing', `${narLabel} عنوان ندارد.`, { narrativeId: narrative.id });
  }
  if (!['lore', 'story', 'scene'].includes(narrative.kind)) {
    add('warning', 'narrative_kind_invalid',
      `${narLabel}: kind نامعتبر «${narrative.kind}» (مجاز: lore/story/scene).`,
      { narrativeId: narrative.id });
  }

  if (!Array.isArray(narrative.sections) || narrative.sections.length === 0) {
    add('warning', 'narrative_sections_empty', `${narLabel} هیچ بخشی ندارد.`, { narrativeId: narrative.id });
  } else {
    const secIds = new Set();
    for (const s of narrative.sections) {
      if (!s.id) {
        add('error', 'section_id_missing', `${narLabel}: یک بخش بدون id است.`, { narrativeId: narrative.id });
      }
      if (secIds.has(s.id)) {
        add('error', 'section_duplicate', `${narLabel}: بخش تکراری با id «${s.id}».`, { narrativeId: narrative.id, sectionId: s.id });
      }
      secIds.add(s.id);

      if (typeof s.triggerTime !== 'number') {
        add('error', 'section_trigger_invalid',
          `${narLabel}: بخش «${s.id}» فیلد triggerTime عددی ندارد.`,
          { narrativeId: narrative.id, sectionId: s.id });
      }

      if (!Array.isArray(s.content)) {
        add('error', 'section_content_invalid',
          `${narLabel}: بخش «${s.id}» فیلد content آرایه نیست.`,
          { narrativeId: narrative.id, sectionId: s.id });
      }
    }
  }

  // unlock
  if (!narrative.unlock) {
    add('error', 'unlock_missing', `${narLabel} هیچ unlock ندارد.`, { narrativeId: narrative.id });
  }
}
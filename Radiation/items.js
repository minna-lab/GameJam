// Définition des objets et tables de loot

const ITEMS = {
  sigma_files:         {id:'sigma_files',        name:'Dossiers SIGMA',         icon:'📁',type:'lore',      desc:'Preuves irréfutables du programme SIGMA.',                flavor:'CONFIDENTIEL — NE PAS DIVULGUER',                  effect:{},                    rarity:'legendary',pts:500},
  keycard_maintenance: {id:'keycard_maintenance', name:'Badge Maintenance',      icon:'🪪',type:'key',       desc:'Badge rouge. Accès zones techniques.',                     flavor:'NIVEAU 2 — MARC DUBOIS',                           effect:{unlocks:'maintenance'},rarity:'uncommon', pts:80},
  keycard_lab:         {id:'keycard_lab',         name:'Badge Laboratoire',      icon:'🔑',type:'key',       desc:'Badge platine. Accès aux labos SIGMA.',                    flavor:'SIGMA — ACCÈS RESTREINT',                          effect:{unlocks:'laboratory'}, rarity:'epic',     pts:150},
  iodine_tablet:       {id:'iodine_tablet',       name:'Comprimé d\'Iode',       icon:'💊',type:'consumable',desc:'Réduit l\'absorption radiation. Rad −20.',                  flavor:'KI-3 · Ne pas dépasser 2/24h',                     effect:{radiation:-20},       rarity:'common',   pts:20},
  antirad_injector:    {id:'antirad_injector',    name:'Injecteur Anti-Rad',     icon:'💉',type:'consumable',desc:'Chélateur puissant. Rad −45, mais HP −5.',                  flavor:'BIOPHAREX · LOT #4471-A',                          effect:{radiation:-45,hp:-5}, rarity:'rare',     pts:60},
  water_bottle:        {id:'water_bottle',        name:'Eau en Bouteille',       icon:'🍶',type:'consumable',desc:'Tiède. Faiblement contaminée. HP +15, Rad +3.',             flavor:'Taux Bq/L non vérifié.',                           effect:{hp:15,radiation:3},   rarity:'common',   pts:15},
  medkit:              {id:'medkit',              name:'Kit Médical',            icon:'🩹',type:'consumable',desc:'Bandages et morphine. HP +40.',                             flavor:'URGENCE MÉDICALE — Expire 2021',                   effect:{hp:40},               rarity:'uncommon', pts:40},
  canned_food:         {id:'canned_food',         name:'Conserve',               icon:'🥫',type:'consumable',desc:'Sans étiquette. HP +20, légère contamination Rad +3.',      flavor:'Couvercle légèrement bombé.',                      effect:{hp:20,radiation:3},   rarity:'common',   pts:20},
  old_photo:           {id:'old_photo',           name:'Vieille Photographie',   icon:'📷',type:'lore',      desc:'Polaroid de l\'hôtel en 1987. Tout allait bien.',           flavor:'Inauguration — 12 juin 1987',                      effect:{},                    rarity:'common',   pts:25},
  flashlight:          {id:'flashlight',          name:'Lampe Torche',           icon:'🔦',type:'tool',      desc:'Piles presque mortes. Encore utile.',                       flavor:'MAGLITE — Piles: 2018',                            effect:{},                    rarity:'common',   pts:15},
  geiger_counter:      {id:'geiger_counter',      name:'Compteur Geiger',        icon:'📻',type:'tool',      desc:'Révèle le niveau de radiation ambiant.',                   flavor:'DOSIMÈTRE PRO-7 · 0–999 mSv/h',                   effect:{},                    rarity:'uncommon', pts:30},
  hazmat_suit:         {id:'hazmat_suit',         name:'Combinaison Hazmat',     icon:'🥼',type:'equipment', desc:'Protection NBC complète. Bouclier +30%.',                   flavor:'Taille L — Trou à réparer.',                       effect:{radiationShield:30},  slot:'body', rarity:'rare',pts:100},
  gas_mask:            {id:'gas_mask',            name:'Masque à Gaz',           icon:'😷',type:'equipment', desc:'Filtre HEPA. Bouclier radiation +15%.',                    flavor:'Filtre changé il y a 3 mois.',                     effect:{radiationShield:15},  slot:'head', rarity:'uncommon',pts:50},
  journal_page:        {id:'journal_page',        name:'Page de Journal',        icon:'📄',type:'lore',      desc:'"Jour 14 — Les symptômes progressent rapidement…"',        flavor:'Écriture tremblante.',                             effect:{},                    rarity:'uncommon', pts:35},
};

const LOOT_POOLS = {
  rdc_hall:    ['old_photo','flashlight','iodine_tablet','water_bottle'],
  rdc_recep:   ['keycard_maintenance','water_bottle','old_photo'],
  rdc_rest:    ['canned_food','water_bottle','old_photo'],
  rdc_kitchen: ['canned_food','medkit','water_bottle'],
  rdc_corr:    ['iodine_tablet','journal_page'],
  rdc_maint:   ['hazmat_suit','gas_mask','geiger_counter','medkit','keycard_lab','antirad_injector'],
  default:     ['old_photo','water_bottle','iodine_tablet','medkit','journal_page','canned_food','antirad_injector','flashlight','geiger_counter','gas_mask','hazmat_suit','keycard_lab','keycard_maintenance'],
};

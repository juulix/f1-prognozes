export interface Country {
  name: string;
  flag: string;
}

export const COUNTRIES: Record<string, Country> = {
  bahrain:       { name: "Bahreina",       flag: "🇧🇭" },
  saudi_arabia:  { name: "Saūda Arābija",  flag: "🇸🇦" },
  australia:     { name: "Austrālija",     flag: "🇦🇺" },
  japan:         { name: "Japāna",         flag: "🇯🇵" },
  china:         { name: "Ķīna",           flag: "🇨🇳" },
  usa_miami:     { name: "ASV (Maiami)",   flag: "🇺🇸" },
  italy_imola:   { name: "Itālija (Imola)", flag: "🇮🇹" },
  monaco:        { name: "Monako",         flag: "🇲🇨" },
  spain:         { name: "Spānija",        flag: "🇪🇸" },
  canada:        { name: "Kanāda",         flag: "🇨🇦" },
  austria:       { name: "Austrija",       flag: "🇦🇹" },
  uk:            { name: "Lielbritānija",  flag: "🇬🇧" },
  belgium:       { name: "Beļģija",        flag: "🇧🇪" },
  hungary:       { name: "Ungārija",       flag: "🇭🇺" },
  netherlands:   { name: "Nīderlande",     flag: "🇳🇱" },
  italy_monza:   { name: "Itālija (Monca)", flag: "🇮🇹" },
  azerbaijan:    { name: "Azerbaidžāna",   flag: "🇦🇿" },
  singapore:     { name: "Singapūra",      flag: "🇸🇬" },
  usa_austin:    { name: "ASV (Ostina)",   flag: "🇺🇸" },
  mexico:        { name: "Meksika",        flag: "🇲🇽" },
  brazil:        { name: "Brazīlija",      flag: "🇧🇷" },
  usa_vegas:     { name: "ASV (Vegasa)",   flag: "🇺🇸" },
  qatar:         { name: "Katara",         flag: "🇶🇦" },
  abu_dhabi:     { name: "Abu Dabi",       flag: "🇦🇪" },
};

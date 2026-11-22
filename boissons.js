/* Alcoolemie - catalogue de boissons.
 * deg : degré en % vol. (toujours modifiable dans l'app).
 * v   : false = degré indicatif, non vérifié auprès d'une source ; à confirmer sur l'étiquette.
 * f   : formats proposés (vol en mL).
 * Degrés vérifiés en novembre 2026 sur les sites des marques ou de distributeurs (Leffe, Guinness, Kronenbourg,
 * 1664, Heineken, Stella Artois, Desperados, Pelforth, Affligem, Grimbergen, Duvel, Delirium, Kwak, Chouffe,
 * Chimay, Super Bock, Ricard, Pastis 51, Menthe-Pastille, Aperol, Campari, Baileys, Malibu, Get, Jägermeister, Loïc Raison). */
(function (root) {
  'use strict';

  var F_BIERE = [{ l: '25 cl', vol: 250 }, { l: '33 cl', vol: 330 }, { l: '50 cl', vol: 500 }];
  var F_VIN = [{ l: 'Verre 12 cl', vol: 120 }, { l: 'Verre 15 cl', vol: 150 }, { l: 'Verre 25 cl', vol: 250 }, { l: 'Bouteille 75 cl', vol: 750 }];
  var F_BULLES = [{ l: 'Flûte 10 cl', vol: 100 }, { l: 'Coupe 12 cl', vol: 120 }, { l: 'Bouteille 75 cl', vol: 750 }];
  var F_CIDRE = [{ l: '25 cl', vol: 250 }, { l: '33 cl', vol: 330 }, { l: 'Bouteille 75 cl', vol: 750 }];
  var F_DOSE = [{ l: '2 cl', vol: 20 }, { l: '4 cl', vol: 40 }, { l: '5 cl', vol: 50 }, { l: '6 cl', vol: 60 }];
  var F_APERO = [{ l: '4 cl', vol: 40 }, { l: '6 cl', vol: 60 }, { l: '10 cl', vol: 100 }];
  var F_PASTIS = [{ l: '2 cl', vol: 20 }, { l: '3 cl', vol: 30 }, { l: '4 cl', vol: 40 }];
  var F_COCKTAIL = [{ l: '15 cl', vol: 150 }, { l: '20 cl', vol: 200 }, { l: '25 cl', vol: 250 }];

  function b(id, nom, deg, f, extra) {
    var o = { id: id, nom: nom, deg: deg, f: f };
    if (extra) for (var k in extra) o[k] = extra[k];
    return o;
  }
  var NOTE_VIN = 'Saisis le degré inscrit sur la bouteille.';

  var groupes = [
    {
      nom: 'Bières',
      items: [
        b('biere-std', 'Bière blonde standard', 5, F_BIERE),
        b('biere-forte', 'Bière forte', 8, F_BIERE),
        b('leffe-blonde', 'Leffe Blonde', 6.6, F_BIERE),
        b('leffe-brune', 'Leffe Brune', 6.5, F_BIERE),
        b('leffe-ruby', 'Leffe Ruby', 5, F_BIERE),
        b('leffe-triple', 'Leffe Triple', 8.5, F_BIERE),
        b('leffe-rituel', 'Leffe Rituel 9°', 9, F_BIERE),
        b('guinness', 'Guinness Draught', 4.2, F_BIERE),
        b('heineken', 'Heineken', 5, F_BIERE),
        b('kronenbourg', 'Kronenbourg', 4.2, F_BIERE),
        b('1664', '1664 Blonde', 5.5, F_BIERE),
        b('1664-blanc', '1664 Blanc', 5, F_BIERE),
        b('stella', 'Stella Artois', 5.2, F_BIERE),
        b('superbock', 'Super Bock', 5.2, F_BIERE),
        b('desperados', 'Desperados Original', 5.9, F_BIERE),
        b('pelforth-blonde', 'Pelforth Blonde', 5.8, F_BIERE),
        b('pelforth-brune', 'Pelforth Brune', 6.5, F_BIERE),
        b('affligem', 'Affligem Blonde', 6.7, F_BIERE),
        b('grimbergen-blonde', 'Grimbergen Blonde', 6.7, F_BIERE),
        b('grimbergen-ambree', 'Grimbergen Ambrée', 6.5, F_BIERE),
        b('grimbergen-triple', 'Grimbergen Triple', 8, F_BIERE),
        b('goudale', 'La Goudale', 7.2, F_BIERE),
        b('duvel', 'Duvel', 8.5, F_BIERE),
        b('delirium', 'Delirium Tremens', 8.5, F_BIERE),
        b('kwak', 'Pauwel Kwak', 8.4, F_BIERE),
        b('chouffe', 'La Chouffe', 8, F_BIERE),
        b('chimay-bleue', 'Chimay Bleue', 9, F_BIERE),
        b('chimay-triple', 'Chimay Triple', 8, F_BIERE),
        b('chimay-doree', 'Chimay Dorée', 4.8, F_BIERE),
        b('chimay-jaune', 'Chimay Jaune', 6.5, F_BIERE),
        b('carlsberg', 'Carlsberg', 5, F_BIERE, { v: false }),
        b('corona', 'Corona', 4.5, F_BIERE, { v: false }),
        b('jupiler', 'Jupiler', 5.2, F_BIERE, { v: false }),
        b('hoegaarden', 'Hoegaarden Blanche', 4.9, F_BIERE, { v: false })
      ]
    },
    {
      nom: 'Cidres',
      items: [
        b('cidre-doux', 'Cidre doux', 3, F_CIDRE),
        b('cidre-demi', 'Cidre demi-sec', 3.5, F_CIDRE, { v: false }),
        b('cidre-brut', 'Cidre brut', 4.5, F_CIDRE, { v: false })
      ]
    },
    {
      nom: 'Vins (degré de la bouteille)',
      items: [
        b('vin-rouge', 'Vin rouge', 13, F_VIN, { v: false, note: NOTE_VIN }),
        b('vin-blanc', 'Vin blanc', 12, F_VIN, { v: false, note: NOTE_VIN }),
        b('vin-rose', 'Vin rosé', 12, F_VIN, { v: false, note: NOTE_VIN }),
        b('champagne', 'Champagne', 12, F_BULLES, { v: false, note: NOTE_VIN }),
        b('cremant', 'Crémant / prosecco', 11.5, F_BULLES, { v: false, note: NOTE_VIN }),
        b('vin-doux', 'Vin doux / liquoreux', 14, F_APERO, { v: false, note: NOTE_VIN })
      ]
    },
    {
      nom: 'Apéritifs et liqueurs',
      items: [
        b('ricard', 'Ricard', 45, F_PASTIS),
        b('ricard-amande', 'Ricard Amande bio (anis vert et amande)', 45, F_PASTIS),
        b('pastis51', 'Pastis 51', 45, F_PASTIS),
        b('aperol', 'Aperol', 11, F_APERO),
        b('campari', 'Campari', 25, F_APERO),
        b('baileys', 'Baileys', 17, F_APERO),
        b('malibu', 'Malibu', 21, F_APERO),
        b('menthe-pastille', 'Menthe-Pastille Giffard', 24, F_DOSE),
        b('get27', 'Get 27', 17.9, F_DOSE),
        b('get31', 'Get 31', 24, F_DOSE),
        b('jager', 'Jägermeister', 35, F_DOSE),
        b('martini', 'Martini (blanc ou rouge)', 14.4, F_APERO, { v: false }),
        b('suze', 'Suze', 15, F_APERO, { v: false }),
        b('pineau', 'Pineau des Charentes', 17, F_APERO, { v: false }),
        b('porto', 'Porto', 20, F_APERO, { v: false })
      ]
    },
    {
      nom: 'Spiritueux',
      items: [
        b('whisky', 'Whisky', 40, F_DOSE),
        b('jack', 'Jack Daniel\'s', 40, F_DOSE),
        b('vodka', 'Vodka', 40, F_DOSE),
        b('gin', 'Gin', 40, F_DOSE),
        b('rhum', 'Rhum', 40, F_DOSE, { v: false }),
        b('tequila', 'Tequila', 38, F_DOSE, { v: false }),
        b('cognac', 'Cognac / armagnac', 40, F_DOSE, { v: false }),
        b('calvados', 'Calvados', 40, F_DOSE, { v: false })
      ]
    },
    {
      nom: 'Cocktails',
      items: [
        b('spritz', 'Aperol Spritz', 9.5, F_COCKTAIL, { v: false }),
        b('cocktail', 'Cocktail (à préciser)', 15, F_COCKTAIL, { v: false })
      ]
    },
    {
      nom: 'Autre',
      items: [
        b('libre', 'Saisie libre', 0, [], { libre: true })
      ]
    }
  ];

  var api = { groupes: groupes };
  root.AlcoBoissons = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);

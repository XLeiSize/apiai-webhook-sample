// wiki.page(query)
// .then(
//   page => {
//     let promises = [
//       page.summary(),
//       page.content(),
//       page.info()
//     ];
//
//     Promise.all(promises)
//     .then(data => {
//       const info = data[2];
//
//       speech += info.name;
//       speech += ' était un artiste de nationalité ';
//       speech += info.nationality + '. ';
//
//       if(info.birth_place) {
//         speech += 'Né à ' + info.birth_place;
//       }
//
//       if(info.birth_date) {
//
//         let bdate = info.birth_date
//         .replace('{{birth date|', '')
//         .replace('df=yes', '')
//         .replace('df=no', '')
//         .replace('}}', '')
//         .split('|');
//
//         bdate = bdate.filter( Number);
//
//         const birth_date = bdate[2] + '/' + bdate[1] + '/' + bdate[0];
//         speech += ' le ' + birth_date;
//       }
//
//       if(info.fields) {
//         const fields = info.field.split(', ');
//
//         speech += ', ses domaines de travail sont :'
//         for (let i = 0; i < fields.length; i++) {
//           speech += ' ' + fields[i];
//           if(i != fields.length - 1 ) {
//             speech += ',';
//           }
//         }
//       }
//
//       speech += '. ';
//
//       if(info.movement) {
//         speech += 'Ses mouvements artistiques associés sont ' + info.movement + '.';
//       }
//
//       if(info.works) {
//         speech += 'Si tu souhaites voir ses meilleures œuvres, je te conseille : ' + info.works + '.';
//       }
//
//       if(info.death_date) {
//
//         let ddate = info.death_date
//         .replace('{{death date and age|', '')
//         .replace('df=yes', '')
//         .replace('df=no', '')
//         .replace('}}', '')
//         .split('|');
//
//         ddate = ddate.filter( Number)
//
//         const death_date = ddate[2] + '/' + ddate[1] + '/' + ddate[0];
//         speech += 'Il est décédé ' + death_date + ' à ' + info.death_place + '.';
//       }
//       responseMessages[responseMessages.length - 1 ].speech = speech;
//       console.log("######################################00000000000000000000000000000000000000", responseMessages);
//
//
//     })
//     .catch(err => {
//       throw err;
//     });
//   }
// )
// .catch(err =>{
//   throw err;
// });

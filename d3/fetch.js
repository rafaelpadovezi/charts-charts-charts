const csv = require('csv');
const fs = require('fs');

const csvOptions = {
  quote: '',
  delimiter: ';',
  columns: true
};

fs.readFile('membros-comissao.csv', 'utf8', (err, data) => {
  if (err)
    return handleError(err);

  csv.parse(data, csvOptions, (err, parsedData) => {
    const comissions = parsedData.reduce((comissionList, current) => {
      const comissionId = current['Comissão'];
      let comission = comissionList.find(c => c.id === comissionId);
      if (comission == undefined) {
        comission = {
          id: current['Comissão'],
          name: current['Nome da Comissão'],
          members: []
        };
        comissionList.push(comission);
      }

      comission.members.push({
        name: current['Nome Parlamentar'],
        head: current['Condição'] === 'T',
        party: current['Partido'],
        indication: current['Indicado pelo']
      });
      return comissionList;
    }, []);
    fs.writeFile('comissions.json', JSON.stringify(comissions), () => console.log('done'));

    const visComissions = comissions.map(c => ({
      name: c.id,
      children: c.members.reduce((parties, member) => {
        let party = parties.find(p => p.name === member.party);
        if (party == undefined) {
          party = {
            name: member.party,
            group: member.indication,
            count: 0
          };
          parties.push(party);
        }
        party.count++;
        return parties;
      }, [])
    }));
    fs.writeFile('visComissions.json', JSON.stringify(visComissions), () => console.log('done'));
  });
});

function handleError(err) {
  console.log(err);
}
function parseRow(row) {
    let cleanRow = {};
    for (let k in row) {
        if (k) cleanRow[k.trim()] = row[k] ? String(row[k]).trim() : '';
    }

    let vendedor = '';
    for (let key in cleanRow) {
        if (key.startsWith('Qual é o vendedor?') && cleanRow[key]) {
            vendedor = cleanRow[key];
            break;
        }
    }

    let lider = '';
    for (let key in cleanRow) {
        if (key.startsWith('Qual é o líder?') && cleanRow[key]) {
            lider = cleanRow[key];
            break;
        }
    }

    const valorNum = parseFloat(
        (cleanRow['VALOR'] || '0')
        .replace('R$', '')
        .replace(/\./g, '')
        .replace(',', '.')
        .trim()
    ) || 0;

    return {
        timestamp: cleanRow['Timestamp'] || '',
        empresa: (cleanRow['Qual empresa?'] || 'GERAL').toUpperCase(),
        lider: lider || 'NÃO INFORMADO',
        vendedor: vendedor || 'NÃO INFORMADO',
        solar: cleanRow['GERADO NO SOLAR?'] || '',
        numSolar: cleanRow['NÚMERO DO SOLAR'] || '-',
        cliente: cleanRow['NOME COMPLETO'] || 'CLIENTE NÃO INFORMADO',
        cpf: cleanRow['CPF/CNPJ'] || '',
        cidade: cleanRow['CIDADE'] || '',
        bairro: cleanRow['BAIRRO'] || '',
        tv: cleanRow['TV'] || '',
        contratoSolar: row['CONTRATO DO SOLAR'] || row.CONTRATO_SOLAR || row.contratoSolar || row.CONTRATO || '',
        virtua: cleanRow['VIRTUA'] || '',
        fone: cleanRow['FONE'] || '',
        chip: cleanRow['CHIP'] || '',
        valor: valorNum,
        status: row.STATUS || row.status || row['SITUAÇÃO'] || row['SITUACAO'] || ''
    };
}

function getFilteredData() {
    const usuarioLogado = String(session?.user?.username || '').trim().toUpperCase();
    const perfil = session?.user?.perfil;

    return rawSales.filter(i => {
        // 1. Garante que VENDEDOR só veja vendas com o seu nome EXATO
        if (perfil === 'VENDEDOR') {
            const vendedorVenda = String(i.vendedor || '').trim().toUpperCase();
            if (vendedorVenda !== usuarioLogado) return false;
        } 
        // 2. Garante que SUPERVISOR só veja vendas da sua equipe exata
        else if (perfil === 'SUPERVISOR') {
            const supervisorVenda = String(i.lider || '').trim().toUpperCase();
            if (supervisorVenda !== usuarioLogado) return false;
        }

        // 3. Filtro por Filial (TODOS / VNA / RDT)
        if (currentBranch === 'TODOS') return true;
        return String(i.empresa || '').toUpperCase().includes(currentBranch);
    });
}
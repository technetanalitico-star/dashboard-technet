function calcularEFormatarValor(row) {
    // Pega o conteúdo das colunas de produtos (AA, AB, AC, AD e Z caso use TV)
    const celulasProdutos = [
        row.TV || row['TV'] || row.Z || '',
        row.VIRTUA || row['VIRTUA'] || row.AA || '',
        row.FONE || row['FONE'] || row.AB || '',
        row.CHIP || row['CHIP'] || row.AC || '',
        row.OUTROS || row['OUTROS'] || row.AD || ''
    ];

    let soma = 0;

    celulasProdutos.forEach(texto => {
        if (!texto) return;
        
        // Captura todos os padrões de preço (ex: R$ 79,90 ou R$49,90)
        const matches = texto.toString().match(/R\$\s*([\d\.]+,\d{2})/gi);
        if (matches) {
            matches.forEach(m => {
                const valStr = m.replace(/R\$\s*/i, '').replace(/\./g, '').replace(',', '.');
                const val = parseFloat(valStr);
                if (!isNaN(val)) soma += val;
            });
        }
    });

    // Pega o texto original que estava na coluna AE (VALOR)
    const textoOriginalAE = (row.VALOR || row['VALOR'] || row.AE || '').toString().trim();

    // Se encontrou valores para somar, gera o novo formato
    if (soma > 0) {
        const somaFormatada = soma.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        return `R$ ${somaFormatada} (${textoOriginalAE})`;
    }

    // Se não encontrou preço nas colunas de produto, mantém o texto original da AE
    return textoOriginalAE;
}







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

    // 1. Checa se VIRTUA, FONE, CHIP ou OUTROS possuem algum valor em R$
    const outrosCampos = [
        cleanRow['VIRTUA'],
        cleanRow['FONE'],
        cleanRow['CHIP'],
        cleanRow['OUTROS']
    ];
    //explicação ponto a ponto: a regex procura por qualquer ocorrência de "R$" seguido de números,
    //  pontos e vírgulas, que é o formato típico de valores monetários no Brasil. O método some()
    //  retorna true se pelo menos um dos campos contiver esse padrão, indicando que há valores monetários
    //  presentes.
    const temOutrosValores = outrosCampos.some(txt => txt && /R\$\s*[\d\.]+,\d{2}/i.test(txt));

    // 2. Processa o campo TV com a regra condicional de Preço Único vs. Combo
    const txtTv = cleanRow['TV'] || '';
    let somaProdutos = 0;

    if (txtTv) {
        // Detecta a oferta de TV BOX com dois valores (ex: R$119,00 | R$79,00)
        if (txtTv.includes('|') && /R\$\s*119,00/i.test(txtTv) && /R\$\s*79,00/i.test(txtTv)) {
            //explicação: se houver valores de R$119,00 e R$79,00 na mesma célula de TV, o código decide 
            // qual valor somar com base na presença de outros produtos. Se houver outros produtos 
            // (VIRTUA, FONE, CHIP ou OUTROS) com valores em R$, ele soma R$79,00; caso contrário, 
            // soma R$119,00.
            somaProdutos += temOutrosValores ? 79.00 : 119.00;
        } else {
            // Para planos de TV convencionais, extrai normalmente os valores em R$
            const matchesTv = txtTv.match(/R\$\s*([\d\.]+,\d{2})/gi);
            if (matchesTv) {
                matchesTv.forEach(m => {
                    const num = parseFloat(m.replace(/R\$\s*/i, '').replace(/\./g, '').replace(',', '.'));
                    if (!isNaN(num)) somaProdutos += num;
                });
            }
        }
    }

    // 3. Sumariza os valores dos demais produtos (VIRTUA, FONE, CHIP, OUTROS)
    outrosCampos.forEach(txt => {
        if (!txt) return;
        const matches = txt.toString().match(/R\$\s*([\d\.]+,\d{2})/gi);
        if (matches) {
            matches.forEach(m => {
                const numStr = m.replace(/R\$\s*/i, '').replace(/\./g, '').replace(',', '.');
                const num = parseFloat(numStr);
                if (!isNaN(num)) somaProdutos += num;
            });
        }
    });

    // 4. Valor numérico original da coluna VALOR (fallback)
    const valorOriginalTxt = cleanRow['VALOR'] || '';
    const valorOriginalNum = parseFloat(
        valorOriginalTxt
        .replace('R$', '')
        .replace(/\./g, '')
        .replace(',', '.')
        .trim()
    ) || 0;

    // 5. Consolida valor numérico e formatação de texto para os cards
    const valorNum = somaProdutos > 0 ? somaProdutos : valorOriginalNum;

    let valorTextoFormatado = valorOriginalTxt;
    if (somaProdutos > 0) {
        const somaFormatada = somaProdutos.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        valorTextoFormatado = `R$ ${somaFormatada}${valorOriginalTxt ? ` (${valorOriginalTxt})` : ''}`;
    }

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
        contratoSolar: cleanRow['CONTRATO DO SOLAR'] || cleanRow['CONTRATO_SOLAR'] || cleanRow['CONTRATO'] || '',
        virtua: cleanRow['VIRTUA'] || '',
        fone: cleanRow['FONE'] || '',
        chip: cleanRow['CHIP'] || '',
        valor: valorNum,
        valorTexto: valorTextoFormatado,
        status: cleanRow['STATUS'] || cleanRow['status'] || cleanRow['SITUAÇÃO'] || cleanRow['SITUACAO'] || ''
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
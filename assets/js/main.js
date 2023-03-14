document.body.innerHTML = `
    <div class="uk-card uk-card-default uk-card-large uk-width-1-2@m uk-position-absolute uk-position-center">
        <div class="uk-card-header">
            <div class="uk-grid-small uk-flex-middle" uk-grid>
                <div class="uk-width-expand">
                    <h3 class="uk-card-title uk-margin-remove-bottom uk-text-center">Transfer Order Label Generator</h3>
                </div>
            </div>
        </div>
        <div class="uk-card-body uk-text-center uk-padding-large">
            <div class="uk-margin">
                <span id="input_file_label">Wybierz dokumenty.</span>
            </div>
        </div>
        <div class="uk-card-footer uk-text-center">
            <div class="uk-margin">
                <div uk-form-custom class="uk-width-expand">
                    <input id="input_file" accept=".xls,.xlsx" multiple="true" type="file" aria-label="Custom controls">
                    <button id="input_file_button" class="uk-button uk-button-secondary uk-width-expand" type="button" tabindex="-1">WYBIERZ</button>
                </div>
                <button class="uk-button uk-button-primary uk-width-expand" id="button_print" onclick="print();" hidden>PODGLĄD</button>
            </div>
        </div>
    </div>
    <div id="labels" hidden></div>
`;

const labelsContainer = document.getElementById('labels');
let labels = [];
const qrCodeSize = 128;

class Label {
    constructor (id, date, time, anc, qty, from_st, from_bin, to_st, to_bin, tr_order, tr_item, material_description, user, unit) {
        this.id = id;
        this.date = new Date(((date) - 25569) * 86400 * 1000).toLocaleDateString("pl-PL", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        });

        const _date = new Date(((date) - 25569) * 86400 * 1000);
        this.weekNumber = this.getWeekNumber(_date);

        this.time = this.formatedTime(time);
        this.normalAnc = anc;
        this.anc = anc.replace(/(.{3})/g, '$1 ');
        this.qty = qty;
        this.from_st = from_st;
        this.from_bin = from_bin;
        this.to_st = to_st;
        this.to_bin = to_bin.padStart(8, '0').replace(/\d{2}(?!$)/g, "$& ");
        this.tr_order = tr_order.padStart(10, '0');
        this.tr_item = tr_item.padStart(4, '0');
        this.material_description = material_description;
        this.user = user;
        this.unit = unit;
        
        this.init();
    }

    getWeekNumber(date) {
        const onejan = new Date(date.getFullYear(), 0, 1);
        const weekNum = Math.ceil((((date - onejan) / 86400000) + onejan.getDay() + 1) / 7);
        if (date.getDay() === 0 && weekNum !== 1) {
          return weekNum - 1;
        }
        return weekNum;
    }

    formatedTime (time) {
        const hour = time * 24;
        const roundedHour = Math.floor(hour);
        const minute = Math.floor((hour - roundedHour) * 60);
        const second = Math.floor((((hour - roundedHour) * 60) - minute) * 60);
        return `${String(roundedHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
    }
    
    init () {
        labelsContainer.innerHTML += `
        <div class="label_container">
            <div class="row">
                <div class="col">
                    <div class="col p0">
                        <span class="fs-2 fw-7 text-center">${this.date}</span>
                    </div>
                    <div class="col p0">
                        <span class="fs-2 fw-5 text-center">${this.time}</span>
                    </div>
                </div>
                <div class="border_col"></div>
                <div class="col flex-100 gap-1">
                    <div class="col p0">
                        <span class="fs-2 fw-7 text-center">${this.material_description}</span>
                    </div>
                </div>
                <div class="border_col"></div>
                <div class="col">
                    <div class="col p0">
                        <span class="fs-2 fw-6 text-center" style="word-break: break-all;">${this.user}</span>
                    </div>
                </div>
            </div>
            <div class="border_row"></div>
            <div class="row">
                <div class="col flex-100">
                    <div class="col p0">
                        <span class="fs-3 fw-6">ANC</span>
                    </div>
                    <div class="col p0">
                        <span class="fs-9 fw-7 text-center">${this.anc}</span>
                    </div>
                </div>
                <div class="border_col"></div>
                <div class="col p05" id="qrANC_${this.id}">
                    
                </div>
            </div>
            <div class="border_row"></div>
            <div class="row">
                <div class="col p05" id="qrQTY_${this.id}">
                    
                </div>
                <div class="border_col"></div>
                <div class="col flex-100">
                    <div class="col p0">
                        <span class="fs-3 fw-6">QTY</span>
                    </div>
                    <div class="col p0">
                        <span class="fs-9 fw-7 text-center">${this.qty} ${this.unit}</span>
                    </div>
                </div>
            </div>
            <div class="border_row"></div>
            <div class="row">
                <div class="col">
                    <div class="col p0">
                        <span class="fs-3 fw-6">TO</span>
                    </div>
                    <div class="col p0">
                        <span class="fs-6 fw-7 text-center">${this.to_st}</span>
                    </div>
                </div>
                <div class="col flex-100">
                    <div class="col p0">
                        <span class="fs-11 fw-7 text-center">${this.to_bin}</span>
                    </div>
                </div>
                <div class="border_col"></div>
                <div class="col p05" id="qrTO_BIN_${this.id}">
                        
                </div>
            </div>
            <div class="border_row"></div>
            <div class="row">
                <div class="col p05" id="qrTR_ORDER_ITEM_${this.id}">
                            
                </div>
                <div class="border_col"></div>
                <div class="col flex-100">
                    <div class="col p0">
                        <span class="fs-3 fw-6">TR.ORDER / ITEM</span>
                    </div>
                    <div class="col p0">
                        <span class="fs-6 fw-7 text-center">${this.tr_order} / ${this.tr_item}</span>
                    </div>
                </div>
                <div class="border_col"></div>
                <div class="col">
                    <div class="col p0">
                        <span class="fs-3 fw-6">WEEK</span>
                    </div>
                    <div class="col p0">
                        <span class="fs-6 fw-7 text-center">${this.weekNumber}</span>
                    </div>
                </div>
            </div>
        </div>
        `;

        labels.push(this);
    }
}

document.getElementById('input_file').addEventListener("change", (_event) => {
    if (printWindow != null) {
        printWindow.close();
    }
    
    const files = _event.target.files;
    if (files.length > 0)
        clearLabels();

    for (let i = 0; i < files.length; i++) {
        document.getElementById('input_file_label').innerText = "Generuje etykiety...";
        let fileReader = new FileReader();
        fileReader.readAsBinaryString(files[i]);
        fileReader.onload = async (event) => {
            let data = event.target.result;
            let workbook = await XLSX.read(data, { type:"binary" });
            await workbook.SheetNames.forEach(async (sheet) => {
                let rowObject = await XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
                for (let i = 0; i < rowObject.length; i++) {
                    const id = labels.length;
                    let _date = Number(rowObject[i]["Creation Date"]);
                    let _time = Number(rowObject[i]["Creation time"]);
                    let _anc = rowObject[i]["Material"].toString();
                    let _qty = rowObject[i]["Source target qty"].toString();
                    let _from_st = rowObject[i]["Source Storage Type"].toString();
                    let _from_bin = rowObject[i]["Source Storage Bin"].toString();
                    let _to_st = rowObject[i]["Dest. Storage Type"].toString();
                    let _to_bin = rowObject[i]["Dest.Storage Bin"].toString();
                    let _tr_order = rowObject[i]["Transfer Order Number"].toString();
                    let _tr_item = rowObject[i]["Transfer order item"].toString();
                    let _material_description = rowObject[i]["Material Description"].toString();
                    let _user = rowObject[i]["User"].toString();
                    let _unit = rowObject[i]["Alternative Unit of Measure"].toString();

                    if (_anc.length > 9) {
                        _anc = _anc.substr(_anc.length - 9);
                    }
                    new Label(id, _date, _time, _anc, _qty, _from_st, _from_bin, _to_st, _to_bin, _tr_order, _tr_item, _material_description, _user, _unit);
                }
            });

            generateQRCodes(i === files.length - 1);
            document.getElementById('input_file_button').hidden = true;
            document.getElementById('input_file_button').parentElement.hidden = true;
        }
    }
});

function clearLabels () {
    labelsContainer.innerHTML = '';
}

async function generateQRCodes (last) {
    for await (label of labels) {
        var qrANC = await new QRCode(document.getElementById("qrANC_" + label.id), {
            width: 96,
            height: 96,
            text: label.normalAnc
        });

        var qrQTY = await new QRCode(document.getElementById("qrQTY_" + label.id), {
            width: 96,
            height: 96,
            text: Number(label.qty).toFixed(0)
        });
        
        var qrTO_BIN = await new QRCode(document.getElementById("qrTO_BIN_" + label.id), {
            width: 96,
            height: 96,
            text: label.to_bin.replace(/\s/g,'')
        });

        var qrTR_ORDER_ITEM = await new QRCode(document.getElementById("qrTR_ORDER_ITEM_" + label.id), {
            width: 96,
            height: 96,
            text: label.tr_order + label.tr_item
        });
    }
    
    if (last)
        readyToPrint();
}

let printWindow;

function print () {
    printWindow = window.open('', 'PRINT', "width=840; height=592;");

    printWindow.document.write(`
        <html>
            <head>
                <title>Transfer Order Labels</title>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/dawidkuprowski/transferorderlabelgenerator@main/assets/css/label.min.css@latest">
            </head>
            <body>`);
    
    for (const child of labelsContainer.children) {
        printWindow.document.write(`<div class="label_container">`);
        printWindow.document.write(child.innerHTML);
        printWindow.document.write(`</div>`);
    }

    printWindow.document.write(`
            </body>
        </html>
    `);

    refreshApp();
}

function refreshApp () {
    clearLabels();
    labels = [];
    document.getElementById('input_file').value = '';
    document.getElementById('button_print').hidden = true;
    document.getElementById('input_file_button').hidden = false;
    document.getElementById('input_file_button').parentElement.hidden = false;
    document.getElementById('input_file_label').innerText = "Wybierz dokumenty do skonwertowania.";
}

refreshApp();

function readyToPrint () {
    document.getElementById('input_file_label').innerText = `Dokumenty zostały pomyślnie skonwertowane.\nWejdź w podgląd i użyj kombinacji przycisków \n"Ctrl + P" aby wydrukować etykiety.`;
    document.getElementById('button_print').hidden = false;
}
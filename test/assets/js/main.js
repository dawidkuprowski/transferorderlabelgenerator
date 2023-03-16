const version = "testowa";
document.querySelector(".version").innerHTML = `Wersja ${version}`;

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
    
    getLayout () {
        return `
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
    }
}

const inputFile = document.getElementById("input_file");
const labelsContainer = document.getElementById("labels");
const logContainer = document.getElementById("log_container");
const loader = document.querySelector(".loader");
const customFileUpload = document.querySelector(".custom_file_upload");

let labels = [];
let printWindow = null;

inputFile.addEventListener("change", async (event) => {
    labels = [];
    const files = event.target.files;
    if (files.length == 0)
        return;

    log("Ładowanie plików...");
    loader.hidden = false;
    customFileUpload.style.display = "none";
        
    try {
        for (let i = 0; i < files.length; i++) {
            log("Konwertowanie...");
            await new Promise((resolve, reject) => {
                var fr = new FileReader();  
                fr.onload = () => {
                    resolve(fr.result);
                }
                fr.onerror = reject;
                fr.readAsBinaryString(files[i]);
            }).then((data) => {
                const workbook = XLSX.read(data, { type:"binary" });
                workbook.SheetNames.forEach((sheet) => {
                    const rowObject = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);
                    rowObject.forEach((row) => {
                        const id = labels.length;
                        let _date = Number(row["Creation Date"]);
                        let _time = Number(row["Creation time"]);
                        let _anc = row["Material"].toString();
                        let _qty = row["Source target qty"].toString();
                        let _from_st = row["Source Storage Type"].toString();
                        let _from_bin = row["Source Storage Bin"].toString();
                        let _to_st = row["Dest. Storage Type"].toString();
                        let _to_bin = row["Dest.Storage Bin"].toString();
                        let _tr_order = row["Transfer Order Number"].toString();
                        let _tr_item = row["Transfer order item"].toString();
                        let _material_description = row["Material Description"].toString();
                        let _user = row["User"].toString();
                        let _unit = row["Alternative Unit of Measure"].toString();
    
                        if (_anc.length > 9) {
                            _anc = _anc.substr(_anc.length - 9);
                        }
                        const label = new Label(id, _date, _time, _anc, _qty, _from_st, _from_bin, _to_st, _to_bin, _tr_order, _tr_item, _material_description, _user, _unit);
                        labels.push(label);
                    });
                });
            });
        }
    } catch (err) {
        alert(err.stack);
        labelsContainer.innerHTML = "";
        customFileUpload.style.display = "block";
        inputFile.value = '';
        loader.hidden = true;
        return;
    }

    labelsContainer.innerHTML = "";
    
    log("Generowanie szablonów...");

    for (let i = 0; i < labels.length; i++) {
        labelsContainer.innerHTML += labels[i].getLayout();
    }

    for (let i = 0; i < labels.length; i++) {
        new QRCode(document.getElementById("qrANC_" + labels[i].id), {
            width: 96,
            height: 96,
            text: labels[i].normalAnc
        });

        new QRCode(document.getElementById("qrQTY_" + labels[i].id), {
            width: 96,
            height: 96,
            text: Number(labels[i].qty).toFixed(0)
        });
        
        new QRCode(document.getElementById("qrTO_BIN_" + labels[i].id), {
            width: 96,
            height: 96,
            text: labels[i].to_bin.replace(/\s/g,'')
        });

        new QRCode(document.getElementById("qrTR_ORDER_ITEM_" + labels[i].id), {
            width: 96,
            height: 96,
            text: labels[i].tr_order + labels[i].tr_item
        });
        console.log(`QRID: ${i}`);
    }
    log(`Uruchamianie podglądu wydruku...`);
    loader.hidden = true;
    window.print();
    customFileUpload.style.display = "block";
    inputFile.value = '';
    log(`Wybierz pliki do skonwertowania.`);
});

const log = (message) => {
    logContainer.innerHTML = message;
}

log(`Wybierz pliki do skonwertowania.`);
const version = "1.3.0";
document.querySelector(".version").innerHTML = version;

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
        //this.from_st = from_st;
        //this.from_bin = from_bin;
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

let startTime, endTime;

inputFile.addEventListener("change", async (event) => {
    startTime = Date.now();
    labels = [];
    const files = event.target.files;
    if (files.length == 0)
        return;

    log("Konwertowanie...");
    loader.hidden = false;
    customFileUpload.style.display = "none";
    const filesLength = files.length;
    try {
        for (let i = 0; i < filesLength; i++) {
            await new Promise((resolve, reject) => {
                var fr = new FileReader();  
                fr.onload = () => {
                    resolve(fr.result);
                }
                fr.onerror = reject;
                fr.readAsBinaryString(files[i]);
            }).then((data) => {
                const workbook = XLSX.read(data, { type:"binary" });
                const sheetNamesLength = workbook.SheetNames.length;
                for (let y = 0; y < sheetNamesLength; y++) {
                    const rowObject = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[workbook.SheetNames[y]]);
                    const rowObjectLength = rowObject.length;
                    for (let x = 0; x < rowObjectLength; x++) {
                        const id = labels.length;
                        let _date = Number(rowObject[x]["Creation Date"]);
                        let _time = Number(rowObject[x]["Creation time"]);
                        let _anc = rowObject[x]["Material"].toString();
                        let _qty = rowObject[x]["Source target qty"].toString();
                        //let _from_st = rowObject[x]["Source Storage Type"].toString();
                        //let _from_bin = rowObject[x]["Source Storage Bin"].toString();
                        let _to_st = rowObject[x]["Dest. Storage Type"].toString();
                        let _to_bin = rowObject[x]["Dest.Storage Bin"].toString();
                        let _tr_order = rowObject[x]["Transfer Order Number"].toString();
                        let _tr_item = rowObject[x]["Transfer order item"].toString();
                        let _material_description = rowObject[x]["Material Description"].toString();
                        let _user = rowObject[x]["User"].toString();
                        let _unit = rowObject[x]["Alternative Unit of Measure"].toString();
    
                        if (_anc.length > 9) {
                            _anc = _anc.substr(_anc.length - 9);
                        }
                        const label = new Label(id, _date, _time, _anc, _qty, "_from_st", "_from_bin", _to_st, _to_bin, _tr_order, _tr_item, _material_description, _user, _unit);
                        labels.push(label);
                    }
                }
            });
        }
    } catch (err) {
        alert(err.stack);
        labelsContainer.innerText = "";
        customFileUpload.style.display = "block";
        inputFile.value = '';
        loader.hidden = true;
        return;
    }

    labelsContainer.innerText = "";
    
    log("Generowanie szablonów...");

    const labelsLength = labels.length;
    let layout = "";

    for (let i = 0; i < labelsLength; i++) {
        layout += labels[i].getLayout();
    }
    labelsContainer.innerHTML = layout;

    for (let i = 0; i < labelsLength; i++) {
        new QRCode(document.getElementById("qrANC_" + labels[i].id), {
            width: 96,
            height: 96,
            text: `${labels[i].normalAnc}\t${labels[i].to_bin.replace(/\s/g,'')}\r`
        });

        /*new QRCode(document.getElementById("qrQTY_" + labels[i].id), {
            width: 96,
            height: 96,
            text: Number(labels[i].qty).toFixed(0)
        });*/
        
        /*new QRCode(document.getElementById("qrTO_BIN_" + labels[i].id), {
            width: 96,
            height: 96,
            text: labels[i].to_bin.replace(/\s/g,'')
        });*/

        new QRCode(document.getElementById("qrTR_ORDER_ITEM_" + labels[i].id), {
            width: 96,
            height: 96,
            text: labels[i].tr_order + labels[i].tr_item
        });
    }
    endTime = Date.now();
    const elapsedTime = endTime - startTime;
    console.log("Operation time: " + elapsedTime + "ms");
    log(`Uruchamianie podglądu wydruku...`);
    loader.hidden = true;
    window.print();
    customFileUpload.style.display = "block";
    inputFile.value = '';
    log(`Wybierz pliki do skonwertowania.`);
});

const log = (message) => {
    logContainer.innerText = message;
}

log(`Wybierz pliki do skonwertowania.`);
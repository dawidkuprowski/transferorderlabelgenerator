import { Label } from "./label.js";

const inputFile = document.getElementById("input_file");
const labelsContainer = document.getElementById("labels");

let labels = [];
let printWindow = null;

inputFile.addEventListener("change", async (event) => {
    labels = [];
    const files = event.target.files;
    if (files.length == 0)
        return;
        
    for (let i = 0; i < files.length; i++) {
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
    labelsContainer.innerHTML = "";
    console.log('start')
    for (let i = 0; i < labels.length; i++) {
        labelsContainer.innerHTML += labels[i].getLayout();
        console.log(`HTMLID: ${i}`);
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
    console.log("end")

    window.print();
});
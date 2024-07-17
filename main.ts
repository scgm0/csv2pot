import { parseArgs } from "jsr:@std/cli/parse-args";
import { basename, dirname } from "jsr:@std/path";
import { parse } from "jsr:@std/csv";

const args = parseArgs(Deno.args);
args.c ??= args["create-po"] ?? "true";
args.a ??= args.add ?? "true";

if (args.help || args.h) {
	console.log(`
csv2pot [options] <csv_path>
将godot csv翻译文件转换为pot文件，并生成po文件
options:
	--help, -h 显示帮助信息
	--separator, -s <separator> csv文件分隔符，默认为','
	--create-po, -c <true|false> 是否生成po文件，默认true
	--add, -a <true|false|key> 是否将csv文件中的翻译写入pot文件，默认true会将csv文件中的第一个翻译pot文件，如果为false，则不写入，如果为key，则将csv文件中的key对应的翻译写入pot文件`
	);

} else {
	await csv2pot(args._[0] as string, JSON.parse(args.c), args.a);
	console.log("完成");
}

async function csv2pot(csv_path: string, po: boolean = true, add: string): Promise<void> {
	let pot_text: string = 'msgid ""\nmsgstr ""\n';
	const po_obj: {
		[key: string]: string
	} = {};
	const csv_text = await Deno.readTextFile(csv_path);
	const csv_arr = parse(csv_text, {
		separator: args.s ?? ",",
		skipFirstRow: true,
		strip: true,
	});

	for (const obj of csv_arr) {
		if (add === "true") {
			pot_text += `\nmsgid "${obj.keys}"\nmsgstr "${obj[Object.keys(obj)[1]]}"\n`;
		} else if (add === "false") {
			pot_text += `\nmsgid "${obj.keys}"\nmsgstr ""\n`;
		} else if (add in obj) {
			pot_text += `\nmsgid "${obj.keys}"\nmsgstr "${obj[add]}"\n`;
		} else {
			throw new Error(`${csv_path}: 未找到key为'${add}'的翻译`);
		}

		if (po) {
			for (const key in obj) {
				if (key !== "keys") {
					po_obj[key] ??= `msgid ""
msgstr ""
"Project-Id-Version: \\n"
"POT-Creation-Date: \\n"
"PO-Revision-Date: \\n"
"Last-Translator: \\n"
"Language-Team: \\n"
"Language: ${key}\\n"
"MIME-Version: 1.0\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Content-Transfer-Encoding: 8bit\\n"
"X-Generator: Poedit 3.4.2\\n"
`
					po_obj[key] += `\nmsgid "${obj.keys}"\nmsgstr "${obj[key]}"\n`;
				}
			}
		}
	}

	const pot_path: string = `${dirname(csv_path)}/${basename(csv_path, ".csv")}.pot`;
	await Deno.writeTextFile(pot_path, pot_text);
	console.log(`已创建 ${pot_path}`);

	if (po) {
		for (const key in po_obj) {
			const po_path: string = `${dirname(csv_path)}/${key}.po`;
			await Deno.writeTextFile(po_path, po_obj[key]);
			console.log(`已创建 ${po_path}`);
		}
	}
}

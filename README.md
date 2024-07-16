# csv2pot

将godot csv翻译文件转换为pot文件，并生成po文件

## 选项

- `--help, -h` 显示帮助信息
- `--separator, -s <separator>` csv文件分隔符，默认为','
- `--create-po, -c <true|false>` 是否生成po文件，默认为true
- `--add, -a <true|false|key>` 是否将csv文件中的翻译写入pot文件，默认true会将csv文件中的第一个翻译pot文件，如果为false，则不写入，如果为key，则将csv文件中的key对应的翻译写入pot文件

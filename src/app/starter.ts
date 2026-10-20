export const starterMarkdown = `# 把 Markdown 一键排进公众号

在左侧粘贴或编写 Markdown，右侧实时预览；点击右上角 **复制到微信**，再到公众号编辑器里 \`Ctrl+V\` 即可。

## 支持的内容

> 好的排版不是装饰，而是降低阅读阻力。

- 标题、引用、列表、**加粗**、*斜体*、~~删除线~~
- 表格与代码块，代码按 Visual Studio 配色高亮
- 直接粘贴或拖入图片，会自动压缩并保存在本机

## 代码示例

\`\`\`csharp
var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.MapGet("/", () => "Hello, .NET!");
app.Run();
\`\`\`

## 表格示例

| 平台 | 运行时 | 说明 |
| --- | :---: | --- |
| Windows | .NET 10 | 长期支持版本 |
| Linux | .NET 10 | 容器部署首选 |
`;

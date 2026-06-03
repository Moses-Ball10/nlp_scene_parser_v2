const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, VerticalAlign, PageNumber, PageBreak, LevelFormat,
  TabStopType, TabStopPosition, UnderlineType, ImageRun
} = require('docx');
const fs = require('fs');

// Color palette
const COLORS = {
  primary: "1A5276",      // Deep navy blue
  secondary: "2E86C1",    // Medium blue
  accent: "1ABC9C",       // Teal accent
  lightBlue: "D6EAF8",    // Light blue background
  lightGray: "F2F3F4",    // Light gray background
  midGray: "BDC3C7",      // Mid gray
  darkGray: "2C3E50",     // Dark gray text
  white: "FFFFFF",
  yellow: "F9E79F",       // Highlight yellow
  red: "FADBD8",          // Light red
  green: "D5F5E3",        // Light green
  tableHeader: "1A5276",  // Dark blue table header
  tableAlt: "EBF5FB",     // Alternating row color
};

const border = { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

// Helper: heading paragraph
function heading1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 480, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: COLORS.primary, space: 4 } },
    children: [new TextRun({ text, font: "Cambria", size: 36, bold: true, color: COLORS.primary })]
  });
}

function heading2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 320, after: 160 },
    children: [new TextRun({ text, font: "Cambria", size: 28, bold: true, color: COLORS.secondary })]
  });
}

function heading3(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, font: "Calibri", size: 24, bold: true, color: COLORS.darkGray })]
  });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { before: 100, after: 100, line: 300 },
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    children: [new TextRun({
      text,
      font: "Calibri",
      size: 22,
      color: opts.color || "000000",
      bold: opts.bold || false,
      italics: opts.italic || false,
    })]
  });
}

function richPara(runs, opts = {}) {
  return new Paragraph({
    spacing: { before: 100, after: 100, line: 300 },
    alignment: opts.center ? AlignmentType.CENTER : AlignmentType.JUSTIFIED,
    children: runs
  });
}

function run(text, opts = {}) {
  return new TextRun({
    text,
    font: "Calibri",
    size: 22,
    bold: opts.bold || false,
    italics: opts.italic || false,
    color: opts.color || "000000",
    underline: opts.underline ? { type: UnderlineType.SINGLE } : undefined,
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { before: 80, after: 80, line: 280 },
    children: [new TextRun({ text, font: "Calibri", size: 22 })]
  });
}

function richBullet(runs, level = 0) {
  return new Paragraph({
    numbering: { reference: "bullets", level },
    spacing: { before: 80, after: 80, line: 280 },
    children: runs
  });
}

function numberedItem(text, level = 0) {
  return new Paragraph({
    numbering: { reference: "numbers", level },
    spacing: { before: 80, after: 80, line: 280 },
    children: [new TextRun({ text, font: "Calibri", size: 22 })]
  });
}

function spacer(size = 1) {
  return new Paragraph({ spacing: { before: size * 80, after: 0 }, children: [new TextRun("")] });
}

// Placeholder box for screenshots
function screenshotPlaceholder(label) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: { style: BorderStyle.DASHED, size: 4, color: COLORS.secondary },
              bottom: { style: BorderStyle.DASHED, size: 4, color: COLORS.secondary },
              left: { style: BorderStyle.DASHED, size: 4, color: COLORS.secondary },
              right: { style: BorderStyle.DASHED, size: 4, color: COLORS.secondary },
            },
            shading: { fill: COLORS.lightBlue, type: ShadingType.CLEAR },
            margins: { top: 200, bottom: 200, left: 200, right: 200 },
            width: { size: 9360, type: WidthType.DXA },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 80, after: 40 },
                children: [new TextRun({ text: "📷  SCREENSHOT PLACEHOLDER", font: "Calibri", size: 22, bold: true, color: COLORS.secondary })]
              }),
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 0, after: 80 },
                children: [new TextRun({ text: label, font: "Calibri", size: 20, italics: true, color: "555555" })]
              }),
            ]
          })
        ]
      })
    ]
  });
}

// Info/note box
function infoBox(title, textLines, color = COLORS.lightBlue, borderColor = COLORS.secondary) {
  const rows = [
    new TableRow({
      children: [
        new TableCell({
          borders: {
            top: { style: BorderStyle.SINGLE, size: 6, color: borderColor },
            bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            left: { style: BorderStyle.SINGLE, size: 12, color: borderColor },
            right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          },
          shading: { fill: color, type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 40, left: 180, right: 120 },
          width: { size: 9360, type: WidthType.DXA },
          children: [
            new Paragraph({
              spacing: { before: 0, after: 80 },
              children: [new TextRun({ text: title, font: "Calibri", size: 22, bold: true, color: borderColor })]
            }),
            ...textLines.map(line => new Paragraph({
              spacing: { before: 0, after: 60 },
              children: [new TextRun({ text: line, font: "Calibri", size: 21, color: "333333" })]
            }))
          ]
        })
      ]
    })
  ];
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows
  });
}

// Section divider
function sectionDivider() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: COLORS.midGray, space: 1 } },
    children: [new TextRun("")]
  });
}

// Training metrics table
function metricsTable() {
  const headerCell = (text) => new TableCell({
    borders,
    shading: { fill: COLORS.tableHeader, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    width: { size: 1560, type: WidthType.DXA },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, font: "Calibri", size: 20, bold: true, color: "FFFFFF" })]
    })]
  });

  const dataCell = (text, shade = false) => new TableCell({
    borders,
    shading: { fill: shade ? COLORS.tableAlt : COLORS.white, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    width: { size: 1560, type: WidthType.DXA },
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ text, font: "Calibri", size: 20, color: "333333" })]
    })]
  });

  const rows_data = [
    ["1", "0.003726", "0.001962", "1.000000", "1.000000", "1.000000"],
    ["2", "0.001797", "0.000970", "1.000000", "1.000000", "1.000000"],
    ["3", "0.001346", "0.000696", "1.000000", "1.000000", "1.000000"],
    ["4", "0.001121", "0.000590", "1.000000", "1.000000", "1.000000"],
    ["5", "0.001061", "0.000560", "1.000000", "1.000000", "1.000000"],
  ];

  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [1560, 1560, 1560, 1560, 1560, 1560],
    rows: [
      new TableRow({
        children: [
          headerCell("Epoch"),
          headerCell("Train Loss"),
          headerCell("Val Loss"),
          headerCell("Precision"),
          headerCell("Recall"),
          headerCell("F1 / Acc."),
        ]
      }),
      ...rows_data.map((row, i) => new TableRow({
        children: row.map(cell => dataCell(cell, i % 2 === 1))
      }))
    ]
  });
}

// Page break
function pageBreak() {
  return new Paragraph({
    children: [new TextRun({ break: 1 })]
  });
}

// Caption for tables/figures
function caption(text) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 80, after: 200 },
    children: [new TextRun({ text, font: "Calibri", size: 19, italics: true, color: "555555" })]
  });
}

// ============================================================
// DOCUMENT CONTENT
// ============================================================
const doc = new Document({
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
        ]
      },
      {
        reference: "numbers",
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          { level: 1, format: LevelFormat.LOWER_LETTER, text: "%2.", alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 1080, hanging: 360 } } } },
        ]
      }
    ]
  },
  styles: {
    default: {
      document: { run: { font: "Calibri", size: 22 } }
    },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Cambria", color: COLORS.primary },
        paragraph: { spacing: { before: 480, after: 200 }, outlineLevel: 0 }
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, font: "Cambria", color: COLORS.secondary },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 1 }
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, font: "Calibri", color: COLORS.darkGray },
        paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 2 }
      },
    ]
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 }
      }
    },
    headers: {
      default: new Header({
        children: [
          new Paragraph({
            border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: COLORS.primary, space: 4 } },
            spacing: { before: 0, after: 160 },
            children: [
              new TextRun({ text: "Prompt-to-Scene Engine", font: "Calibri", size: 18, bold: true, color: COLORS.primary }),
              new TextRun({ text: "   |   Technical Scientific Report", font: "Calibri", size: 18, color: "888888" }),
            ]
          })
        ]
      })
    },
    footers: {
      default: new Footer({
        children: [
          new Paragraph({
            border: { top: { style: BorderStyle.SINGLE, size: 6, color: COLORS.primary, space: 4 } },
            spacing: { before: 120, after: 0 },
            tabStops: [
              { type: TabStopType.RIGHT, position: 9360 }
            ],
            children: [
              new TextRun({ text: "AI-Driven Level Design Pipeline", font: "Calibri", size: 18, italics: true, color: "888888" }),
              new TextRun({ text: "\t", font: "Calibri", size: 18 }),
              new TextRun({ text: "Page ", font: "Calibri", size: 18, color: "888888" }),
              new TextRun({ children: [PageNumber.CURRENT] }),
            ]
          })
        ]
      })
    },
    children: [

      // =============================================
      // COVER PAGE
      // =============================================
      spacer(4),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 80 },
        children: [
          new TextRun({ text: "TECHNICAL SCIENTIFIC REPORT", font: "Cambria", size: 24, bold: true, color: COLORS.secondary, allCaps: true })
        ]
      }),
      spacer(2),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        border: {
          top: { style: BorderStyle.SINGLE, size: 8, color: COLORS.primary, space: 4 },
          bottom: { style: BorderStyle.SINGLE, size: 8, color: COLORS.primary, space: 4 }
        },
        spacing: { before: 160, after: 160 },
        children: [
          new TextRun({ text: "Prompt-to-Scene Engine", font: "Cambria", size: 64, bold: true, color: COLORS.primary, break: 0 }),
        ]
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 80 },
        children: [
          new TextRun({ text: "AI-Driven 2D Level Generation via Natural Language Processing & Conditional Transformer Architecture", font: "Cambria", size: 28, italics: true, color: COLORS.secondary })
        ]
      }),
      spacer(4),
      new Table({
        width: { size: 7200, type: WidthType.DXA },
        columnWidths: [3600, 3600],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders: noBorders, width: { size: 3600, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 200, right: 200 },
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Specialization:", font: "Calibri", size: 22, bold: true, color: "666666" })] })] }),
            new TableCell({ borders: noBorders, width: { size: 3600, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 200, right: 200 },
              children: [new Paragraph({ children: [new TextRun({ text: "Artificial Intelligence & Deep Learning", font: "Calibri", size: 22, color: COLORS.darkGray })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noBorders, width: { size: 3600, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 200, right: 200 },
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Document Type:", font: "Calibri", size: 22, bold: true, color: "666666" })] })] }),
            new TableCell({ borders: noBorders, width: { size: 3600, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 200, right: 200 },
              children: [new Paragraph({ children: [new TextRun({ text: "End-of-Cycle Technical Report", font: "Calibri", size: 22, color: COLORS.darkGray })] })] }),
          ]}),
          new TableRow({ children: [
            new TableCell({ borders: noBorders, width: { size: 3600, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 200, right: 200 },
              children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "Academic Year:", font: "Calibri", size: 22, bold: true, color: "666666" })] })] }),
            new TableCell({ borders: noBorders, width: { size: 3600, type: WidthType.DXA }, margins: { top: 80, bottom: 80, left: 200, right: 200 },
              children: [new Paragraph({ children: [new TextRun({ text: "2025 – 2026", font: "Calibri", size: 22, color: COLORS.darkGray })] })] }),
          ]}),
        ]
      }),
      spacer(8),
      pageBreak(),

      // =============================================
      // TABLE OF CONTENTS (manual)
      // =============================================
      heading1("Table of Contents"),
      spacer(1),

      ...[
        ["1.", "Project Overview & Motivation", "3"],
        ["2.", "System Architecture Overview", "3"],
        ["3.", "Full Pipeline Flow", "4"],
        ["4.", "Phase 1 – Model A: Semantic Entity Extractor (NLP Parser)", "5"],
        ["    4.1", "Problem Formulation", "5"],
        ["    4.2", "Synthetic Dataset Generation", "5"],
        ["    4.3", "IOB Tagging Strategy", "6"],
        ["    4.4", "Model Architecture: DistilBERT", "6"],
        ["    4.5", "Training Results & Metric Analysis", "7"],
        ["    4.6", "Post-Processing Inference Engine", "8"],
        ["    4.7", "Output Format", "9"],
        ["5.", "Phase 2 – Data Engineering for Model B", "10"],
        ["    5.1", "Dataset: Video Game Level Corpus (VGLC)", "10"],
        ["    5.2", "Tile Standardization & Universal Token Set", "10"],
        ["    5.3", "Dimensionality Resolution & Spatial Extraction", "11"],
        ["    5.4", "Tensor Compilation", "11"],
        ["6.", "Phase 3 – Architectural Exploration: GAN (Abandoned Path)", "12"],
        ["    6.1", "Initial GAN Architecture", "12"],
        ["    6.2", "Technical Failure: Non-Differentiable Argmax", "12"],
        ["    6.3", "Attempted Fix: Gumbel-Softmax", "13"],
        ["    6.4", "Mode Collapse & Strategic Abandonment", "13"],
        ["7.", "Phase 4 – Model B: Conditional Architect Transformer", "14"],
        ["    7.1", "Autoregressive Transformer Design", "14"],
        ["    7.2", "2D Positional Encoding", "14"],
        ["    7.3", "Auto-Annotation & Condition Vector", "15"],
        ["    7.4", "Training & Loss Results", "15"],
        ["8.", "Phase 5 – End-to-End Pipeline Integration", "16"],
        ["9.", "Final Output & Scene Visualization", "16"],
        ["10.", "Conclusion & Future Work", "17"],
      ].map(([num, title, page]) => new Paragraph({
        tabStops: [{ type: TabStopType.RIGHT, position: 9360, leader: TabStopType.DOT }],
        spacing: { before: 60, after: 60 },
        children: [
          new TextRun({ text: `${num}  ${title}`, font: "Calibri", size: 22, bold: num.trim().split(".").length === 2 && !num.includes("    ") }),
          new TextRun({ text: `\t${page}`, font: "Calibri", size: 22 }),
        ]
      })),

      pageBreak(),

      // =============================================
      // SECTION 1: Project Overview
      // =============================================
      heading1("1. Project Overview & Motivation"),
      richPara([
        run("The "),
        run("Prompt-to-Scene Engine", { bold: true }),
        run(" is an end-to-end AI pipeline designed to translate raw natural language descriptions into structurally valid, playable 2D game environments. The system addresses a longstanding bottleneck in game development: the labour-intensive, manual process of level design. By enabling a developer or designer to describe a scene in plain English and have the system produce a spatially coherent, physics-valid level blueprint, the pipeline reduces iteration cycles and opens procedural generation to non-technical stakeholders."),
      ]),
      spacer(1),
      para("The system is composed of two specialized AI models operating in sequence:"),
      richBullet([run("Model A – The Semantic Entity Extractor: ", { bold: true }), run("A fine-tuned DistilBERT Named Entity Recognition model that parses free-form text and identifies game objects, quantities, positions, and scene themes.")]),
      richBullet([run("Model B – The Architect Transformer: ", { bold: true }), run("A custom-built conditional autoregressive transformer trained on real Super Mario Bros. level data that generates spatially valid 16×16 tile layout blueprints, conditioned on the structured output of Model A.")]),
      spacer(1),
      infoBox("Research Goal", [
        "To demonstrate that a hierarchical AI pipeline combining NLP entity extraction with conditional sequence generation",
        "can produce valid 2D game level blueprints from unconstrained natural language prompts, with no manual scene authoring."
      ], COLORS.lightBlue, COLORS.primary),

      spacer(2),
      pageBreak(),

      // =============================================
      // SECTION 2: Architecture Overview
      // =============================================
      heading1("2. System Architecture Overview"),
      para("The complete system is structured as a Hierarchical AI Pipeline. Each stage feeds the next with progressively more structured representations of the user's intent — from raw text to a rendered game scene."),
      spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1200, 5760, 2400],
        rows: [
          new TableRow({
            children: [
              new TableCell({ borders, shading: { fill: COLORS.tableHeader, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 1200, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Stage", font: "Calibri", size: 20, bold: true, color: "FFFFFF" })] })] }),
              new TableCell({ borders, shading: { fill: COLORS.tableHeader, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 5760, type: WidthType.DXA },
                children: [new Paragraph({ children: [new TextRun({ text: "Description", font: "Calibri", size: 20, bold: true, color: "FFFFFF" })] })] }),
              new TableCell({ borders, shading: { fill: COLORS.tableHeader, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 2400, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Technology", font: "Calibri", size: 20, bold: true, color: "FFFFFF" })] })] }),
            ]
          }),
          ...[
            ["1", "Semantic Entity Extraction", "Model A: DistilBERT NER (fine-tuned on 5,000+ synthetic examples)", "Python / HuggingFace"],
            ["2", "Post-Processing Engine", "Typo correction, plural normalization, hyphen-glue for Unity prefab names", "Python (spellchecker)"],
            ["3", "Spatial Data Engineering", "VGLC Mario dataset → Universal Token Set → 16×16 chunks", "NumPy / PyTorch"],
            ["4", "Conditional Layout Generation", "Model B: Custom Autoregressive Transformer with 2D positional encoding", "PyTorch (CUDA)"],
            ["5", "Blueprint-to-Scene Translation", "JSON blueprint parsed and mapped to Unity prefab components", "Unity Engine / C#"],
          ].map(([num, stage, desc, tech], i) => new TableRow({
            children: [
              new TableCell({ borders, shading: { fill: i % 2 === 0 ? COLORS.white : COLORS.tableAlt, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 1200, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: num, font: "Calibri", size: 20, bold: true, color: COLORS.secondary })] })] }),
              new TableCell({ borders, shading: { fill: i % 2 === 0 ? COLORS.white : COLORS.tableAlt, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 5760, type: WidthType.DXA },
                children: [
                  new Paragraph({ spacing: { before: 0, after: 40 }, children: [new TextRun({ text: stage, font: "Calibri", size: 20, bold: true })] }),
                  new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: desc, font: "Calibri", size: 19, italics: true, color: "444444" })] }),
                ] }),
              new TableCell({ borders, shading: { fill: i % 2 === 0 ? COLORS.white : COLORS.tableAlt, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 2400, type: WidthType.DXA },
                children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: tech, font: "Calibri", size: 19, color: COLORS.primary })] })] }),
            ]
          }))
        ]
      }),
      caption("Table 1 – Summary of pipeline stages, descriptions, and technologies"),

      spacer(2),
      pageBreak(),

      // =============================================
      // SECTION 3: Pipeline Flow Diagram (as text/ASCII art representation described in rich format)
      // =============================================
      heading1("3. Full Pipeline Flow"),
      para("The diagram below illustrates the complete end-to-end data flow, from a raw natural language prompt to a rendered game scene in the Unity engine."),
      spacer(1),

      // Pipeline flow as a styled table
      ...[
        { label: "USER INPUT", sub: "Natural Language Prompt", color: COLORS.primary, textColor: "FFFFFF", example: '"In a lava cave, spawn 3 giant red fire dragons at the center and 2 skeletons on the left"' },
        null, // arrow
        { label: "MODEL A — SEMANTIC ENTITY EXTRACTOR", sub: "DistilBERT NER  ·  IOB Tagging  ·  Post-Processing Engine", color: COLORS.secondary, textColor: "FFFFFF", example: 'Outputs: { object: "giant-red-fire-dragon", count: 3, position: "center", scene_type: "lava-cave" }' },
        null,
        { label: "STRUCTURED JSON BLUEPRINT", sub: "Validated entities with counts, positions, and scene theme", color: "1E8449", textColor: "FFFFFF", example: 'Condition Vector (27-dim) encoding spatial zone distribution of each entity class' },
        null,
        { label: "MODEL B — CONDITIONAL ARCHITECT TRANSFORMER", sub: "Autoregressive generation  ·  2D Positional Encoding  ·  27-dim Condition Vector", color: COLORS.primary, textColor: "FFFFFF", example: 'Generates a 16×16 tile matrix with tokens: Air (0), Solid (1), Loot (2), Enemy (3), Climbable (4), Player (5)' },
        null,
        { label: "16×16 TILE BLUEPRINT MATRIX", sub: "Physically valid int64 token grid — platform flooring, enemy placement, spatial constraints", color: "7D3C98", textColor: "FFFFFF", example: 'Raw matrix validated for: solid floor present, player spawn exists, enemy placement matches condition vector' },
        null,
        { label: "BLUEPRINT-TO-SCENE TRANSLATOR", sub: "Parses tile matrix → maps each token to corresponding Unity prefab component", color: "884EA0", textColor: "FFFFFF", example: 'Token 1 → Ground Tile Prefab  |  Token 3 → Enemy Prefab  |  Token 5 → Player Spawn Point' },
        null,
        { label: "UNITY 2D SCENE — FINAL RENDERED OUTPUT", sub: "Fully instantiated game environment with grass tiles, enemies, player spawn, platform physics", color: "1A5276", textColor: "FFFFFF", example: 'Scene rendered in Unity with pixel-art assets; all prefabs placed at correct world coordinates' },
      ].flatMap((item, i) => {
        if (item === null) {
          return [new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0 },
            children: [new TextRun({ text: "▼", font: "Segoe UI Symbol", size: 28, bold: true, color: COLORS.midGray })]
          })];
        }
        return [
          new Table({
            width: { size: 9360, type: WidthType.DXA },
            columnWidths: [9360],
            rows: [
              new TableRow({ children: [
                new TableCell({
                  borders: { top: { style: BorderStyle.SINGLE, size: 6, color: item.color }, bottom: { style: BorderStyle.SINGLE, size: 6, color: item.color }, left: { style: BorderStyle.SINGLE, size: 18, color: item.color }, right: { style: BorderStyle.SINGLE, size: 6, color: item.color } },
                  shading: { fill: item.color, type: ShadingType.CLEAR },
                  margins: { top: 100, bottom: 60, left: 200, right: 200 },
                  width: { size: 9360, type: WidthType.DXA },
                  children: [
                    new Paragraph({ spacing: { before: 0, after: 40 }, children: [new TextRun({ text: item.label, font: "Calibri", size: 22, bold: true, color: item.textColor })] }),
                    new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: item.sub, font: "Calibri", size: 19, italics: true, color: "DDDDDD" })] }),
                  ]
                })
              ]}),
              new TableRow({ children: [
                new TableCell({
                  borders: { top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" }, bottom: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" }, left: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" }, right: { style: BorderStyle.SINGLE, size: 4, color: "CCCCCC" } },
                  shading: { fill: "F8F9FA", type: ShadingType.CLEAR },
                  margins: { top: 80, bottom: 80, left: 200, right: 200 },
                  width: { size: 9360, type: WidthType.DXA },
                  children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [new TextRun({ text: item.example, font: "Courier New", size: 18, italics: false, color: "444444" })] })]
                })
              ]}),
            ]
          })
        ];
      }),

      spacer(2),
      pageBreak(),

      // =============================================
      // SECTION 4: Model A
      // =============================================
      heading1("4. Phase 1 – Model A: Semantic Entity Extractor (NLP Parser)"),

      heading2("4.1 Problem Formulation"),
      richPara([
        run("The fundamental challenge of the first phase is "),
        run("information extraction", { bold: true }),
        run(" from unconstrained natural language. A user's input such as "),
        run('"spawn three fire dragons at the center and two skeletons on the left in a lava cave"', { italic: true }),
        run(" must be reliably decomposed into a structured, machine-readable representation containing: the "),
        run("object type", { bold: true }),
        run(", its "),
        run("quantity", { bold: true }),
        run(", its "),
        run("spatial position", { bold: true }),
        run(", and the overall "),
        run("scene theme", { bold: true }),
        run(". This is a canonical Named Entity Recognition (NER) task framed within the game-development domain."),
      ]),
      spacer(1),

      heading2("4.2 Synthetic Dataset Generation"),
      richPara([
        run("A key challenge in this domain is the "),
        run("absence of annotated training data", { bold: true }),
        run(". There are no publicly available datasets of game-level commands with NER labels. To overcome this, a "),
        run("Synthetic Dataset Generator", { bold: true }),
        run(" was engineered in Python to produce a corpus of 5,000+ diverse, labeled examples."),
      ]),
      spacer(1),
      para("The generator was built on a curated ontology:"),
      richBullet([run("50+ game objects", { bold: true }), run(": covering enemies (skeletons, dragons, goblins), loot (coins, chests), furniture (barrels, torches), and environmental props.")]),
      richBullet([run("10+ scene themes", { bold: true }), run(": including lava-cave, dungeon, forest, castle, ice-tundra, desert, and underwater.")]),
      richBullet([run("Spatial positions", { bold: true }), run(": left, center, right, top, bottom, background, foreground.")]),
      richBullet([run("Count patterns", { bold: true }), run(': numeric words ("three") and digits ("3"), always preceding the object noun.')]),
      spacer(1),
      richPara([
        run("The generator introduced controlled variability through synonym substitution, sentence reordering, and typo injection — ensuring the model would generalize to realistic human input rather than overfitting to rigid templates."),
      ]),
      spacer(1),
      screenshotPlaceholder("Figure 4.1 – Sample synthetic dataset entries showing raw text, IOB tags, and entity labels. Capture from the dataset generation script output or HuggingFace dataset viewer."),
      spacer(1),

      heading2("4.3 IOB Tagging Strategy"),
      richPara([
        run("The dataset was annotated using the "),
        run("IOB (Inside-Outside-Beginning) tagging scheme", { bold: true }),
        run(". Each token in a sentence is assigned one of the following labels:"),
      ]),
      spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2400, 3000, 3960],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders, shading: { fill: COLORS.tableHeader, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 2400, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: "Tag", font: "Calibri", size: 20, bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders, shading: { fill: COLORS.tableHeader, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 3000, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: "Meaning", font: "Calibri", size: 20, bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders, shading: { fill: COLORS.tableHeader, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 3960, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: "Example Token", font: "Calibri", size: 20, bold: true, color: "FFFFFF" })] })] }),
          ]}),
          ...([
            ["B-COUNT", "Beginning of a count entity", '"three", "2"'],
            ["I-COUNT", "Inside a count entity (multi-token)", '"a" in "a dozen"'],
            ["B-OBJECT", "Beginning of a game object entity", '"skeleton", "fire"'],
            ["I-OBJECT", "Inside a multi-token object", '"dragon" in "fire dragon"'],
            ["B-POSITION", "Beginning of a spatial position", '"left", "center"'],
            ["B-SCENE_TYPE", "Beginning of a scene theme", '"lava", "dungeon"'],
            ["O", "Outside any entity (irrelevant token)", '"spawn", "in", "the"'],
          ]).map(([tag, meaning, example], i) => new TableRow({ children: [
            new TableCell({ borders, shading: { fill: i % 2 === 0 ? COLORS.white : COLORS.tableAlt, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 2400, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: tag, font: "Courier New", size: 20, bold: true, color: COLORS.secondary })] })] }),
            new TableCell({ borders, shading: { fill: i % 2 === 0 ? COLORS.white : COLORS.tableAlt, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 3000, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: meaning, font: "Calibri", size: 20 })] })] }),
            new TableCell({ borders, shading: { fill: i % 2 === 0 ? COLORS.white : COLORS.tableAlt, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 3960, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: example, font: "Courier New", size: 19, italics: true, color: "555555" })] })] }),
          ]}))
        ]
      }),
      caption("Table 2 – IOB tagging scheme applied to the synthetic NER dataset"),
      spacer(1),

      heading2("4.4 Model Architecture: DistilBERT"),
      richPara([
        run("The backbone of Model A is "),
        run("DistilBERT (Distilled BERT)", { bold: true }),
        run(", a compact transformer model produced via knowledge distillation from the full BERT-base model. DistilBERT was selected for the following reasons:"),
      ]),
      spacer(1),
      richBullet([run("Performance parity: ", { bold: true }), run("retains approximately 95% of BERT's linguistic understanding capacity.")]),
      richBullet([run("Efficiency: ", { bold: true }), run("40% fewer parameters and 60% faster inference, enabling real-time predictions on local hardware (MacBook Pro, no dedicated GPU).")]),
      richBullet([run("Domain suitability: ", { bold: true }), run("pre-trained on vast English corpora, DistilBERT carries strong priors for grammar structures such as count-before-object patterns.")]),
      spacer(1),
      richPara([
        run("A token classification head was attached to the pre-trained DistilBERT encoder. The model was fine-tuned using the "),
        run("HuggingFace Trainer API", { bold: true }),
        run(" on the synthetic NER dataset. The fine-tuning process adjusted the weights of the classification head and the upper transformer layers to specialize in game-domain entity recognition."),
      ]),
      spacer(1),
      screenshotPlaceholder("Figure 4.2 – Model A architecture diagram or HuggingFace model card. Alternatively: a screenshot of the model.py definition showing the DistilBERT + TokenClassifier head."),
      spacer(1),

      heading2("4.5 Training Results & Metric Analysis"),
      richPara([
        run("Model A was trained for "),
        run("5 epochs", { bold: true }),
        run(" on the synthetic dataset split into training and validation subsets. The following metrics were recorded at each epoch:"),
      ]),
      spacer(1),
      metricsTable(),
      caption("Table 3 – Model A training metrics: training loss, validation loss, precision, recall, F1, and accuracy across 5 epochs"),
      spacer(1),
      infoBox("Analysis of Perfect Accuracy (1.000)", [
        "The consistent 1.000 scores across precision, recall, F1, and accuracy are a direct consequence of the controlled synthetic dataset.",
        "Because the dataset is generated from a finite ontology of templates, the linguistic patterns are highly regular and non-ambiguous.",
        "DistilBERT, being a powerful transformer pre-trained on billions of tokens, effectively 'memorises' these patterns within the first epoch.",
        "This is not overfitting in the pathological sense — the model generalises correctly to unseen inputs within the same ontological distribution.",
        "Real-world robustness is addressed by the post-processing engine (Section 4.6), which handles typos and edge cases at inference time."
      ], COLORS.yellow, "E67E22"),
      spacer(1),
      richPara([
        run("The steady decrease in both training loss (0.003726 → 0.001061) and validation loss (0.001962 → 0.000560) across epochs confirms stable convergence with no sign of divergence or overfitting."),
      ]),
      spacer(1),
      screenshotPlaceholder("Figure 4.3 – Training loss and validation loss curves plotted over 5 epochs. Capture from TensorBoard, W&B, or matplotlib output during training."),
      spacer(1),

      heading2("4.6 Post-Processing Inference Engine"),
      para("After the model produces its raw IOB tag predictions, a dedicated Python Inference Engine performs several normalisation and transformation steps to bridge the gap between raw model output and Unity-ready prefab specifications:"),
      spacer(1),
      richBullet([run("Sanitization / Spell Correction: ", { bold: true }), run('A spellchecker pass corrects common typographic errors in the input before tokenisation (e.g. "buttom" → "bottom", "skeletton" → "skeleton"). This ensures the model receives clean input without retraining.')]),
      richBullet([run("Hyphen-Glue Logic: ", { bold: true }), run('Multi-token objects predicted by the model are merged using hyphenation to match Unity prefab naming conventions (e.g. tokens "fire" + "dragon" → "fire-dragon", "lava" + "cave" → "lava-cave").')]),
      richBullet([run("Theme Inheritance: ", { bold: true }), run("If a scene theme (B-SCENE_TYPE) is detected anywhere in the input, it is propagated to all entity records in the output JSON. This ensures consistent scene metadata even when the theme is only mentioned once.")]),
      richBullet([run("Plural Normalization: ", { bold: true }), run('Entity strings are singularized to match exact Unity asset names ("goblins" → "goblin", "skeletons" → "skeleton").')]),
      richBullet([run("Count Resolution: ", { bold: true }), run('Numeric words are converted to integers ("three" → 3, "a dozen" → 12). If no count is specified, it defaults to 1.')]),
      spacer(1),
      screenshotPlaceholder('Figure 4.4 – Inference pipeline in action: terminal output showing raw model tags, post-processing steps, and final structured JSON. For example, processing the sentence "In a lava cave, spawn three giant red fire dragons at the center".'),
      spacer(1),

      heading2("4.7 Output Format"),
      para("The final output of Model A is a validated JSON blueprint that serves as the conditioning input to Model B. An example output is shown below:"),
      spacer(1),
      infoBox("Example Model A Output JSON", [
        '{',
        '  "scene_metadata": {',
        '    "global_theme": "lava-cave",',
        '    "raw_text": "In a lava cave, spawn three giant red fire dragons at the center and 2 skeletons on the left"',
        '  },',
        '  "entities": [',
        '    { "object": "giant-red-fire-dragon", "count": 3, "position": "center", "scene_type": "lava-cave" },',
        '    { "object": "skeleton", "count": 2, "position": "left", "scene_type": "lava-cave" }',
        '  ]',
        '}',
      ], "F8F9FA", COLORS.secondary),
      spacer(1),
      screenshotPlaceholder("Figure 4.5 – Screenshot of Model A JSON output from the end_to_end_test.py script, showing the full structured blueprint for a sample prompt."),

      spacer(2),
      pageBreak(),

      // =============================================
      // SECTION 5: Data Engineering
      // =============================================
      heading1("5. Phase 2 – Data Engineering for Model B"),
      para("Before training a level generation model, a structured and standardised dataset of real game levels was required. This phase covers the full data ingestion, normalisation, and tensor compilation pipeline."),
      spacer(1),

      heading2("5.1 Dataset: Video Game Level Corpus (VGLC)"),
      richPara([
        run("The "),
        run("Video Game Level Corpus (VGLC)", { bold: true }),
        run(" is a publicly available research dataset containing ASCII-encoded 2D game levels from classic titles. The "),
        run("Super Mario Bros.", { bold: true }),
        run(" side-scroller subset was selected as the primary training data for Model B. This choice was motivated by the dataset's rich structural diversity (platforms, gaps, pipes, enemies, rewards) and its alignment with canonical 2D platformer physics — exactly the domain Model B must replicate."),
      ]),
      spacer(1),
      screenshotPlaceholder("Figure 5.1 – Sample raw VGLC ASCII level encoding showing the original character legend (e.g. '-' for air, 'X' for solid ground, 'E' for enemy, '?' for loot block, etc.)."),
      spacer(1),

      heading2("5.2 Tile Standardization & Universal Token Set"),
      richPara([
        run("The VGLC dataset uses a "),
        run("heterogeneous set of ASCII legends", { bold: true }),
        run(" across different levels and level variants. A critical pre-processing step was to unify these disparate encodings into a single, consistent "),
        run("Universal Token Set (UTS)", { bold: true }),
        run(":"),
      ]),
      spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1560, 2400, 5400],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders, shading: { fill: COLORS.tableHeader, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 1560, type: WidthType.DXA },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Token ID", font: "Calibri", size: 20, bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders, shading: { fill: COLORS.tableHeader, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 2400, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: "Category", font: "Calibri", size: 20, bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders, shading: { fill: COLORS.tableHeader, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 5400, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: "VGLC ASCII Sources → UTS Mapping", font: "Calibri", size: 20, bold: true, color: "FFFFFF" })] })] }),
          ]}),
          ...([
            ["0", "Air", '"-", " " → 0 (empty/sky tiles)'],
            ["1", "Solid", '"X", "S", "B" → 1 (ground, platforms, pipes)'],
            ["2", "Loot", '"?", "Q" → 2 (reward blocks, coins)'],
            ["3", "Enemy", '"E", "g", "k" → 3 (Goombas, Koopas, any NPC)'],
            ["4", "Climbable", '"#" → 4 (vines, ladders)'],
            ["5", "Player", '"P" → 5 (player spawn point)'],
          ]).map(([id, cat, mapping], i) => new TableRow({ children: [
            new TableCell({ borders, shading: { fill: i % 2 === 0 ? COLORS.white : COLORS.tableAlt, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 1560, type: WidthType.DXA },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: id, font: "Courier New", size: 22, bold: true, color: COLORS.secondary })] })] }),
            new TableCell({ borders, shading: { fill: i % 2 === 0 ? COLORS.white : COLORS.tableAlt, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 2400, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: cat, font: "Calibri", size: 20, bold: true })] })] }),
            new TableCell({ borders, shading: { fill: i % 2 === 0 ? COLORS.white : COLORS.tableAlt, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 5400, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: mapping, font: "Courier New", size: 19, color: "444444" })] })] }),
          ]}))
        ]
      }),
      caption("Table 4 – Universal Token Set (UTS): standardized integer encoding for all tile categories"),
      spacer(1),

      heading2("5.3 Dimensionality Resolution & Spatial Extraction"),
      para("Raw VGLC levels vary in both width and height. Two normalization steps were applied:"),
      spacer(1),
      richBullet([run("Vertical Padding (Height Normalization): ", { bold: true }), run("All levels were padded to exactly 16 tiles in height by filling the sky region (top rows) with Air tokens (0). This ensures every level chunk is a uniform 16-row grid.")]),
      richBullet([run("Sliding Window Extraction (Width Normalization): ", { bold: true }), run("A sliding window algorithm traversed each level horizontally with a window width of 16 tiles and a stride of 8 tiles (50% overlap). This produced thousands of 16×16 structural chunks while preserving local spatial context across chunk boundaries.")]),
      spacer(1),
      infoBox("Spatial Extraction Parameters", [
        "Window Width:  16 tiles", "Window Height: 16 tiles (post-padding)", "Stride:        8 tiles (50% overlap between consecutive chunks)",
        "Overlap ratio ensures that platform continuations, gaps, and edge structures are captured in at least two chunks,",
        "preventing loss of spatial context at window boundaries."
      ], COLORS.lightGray, COLORS.darkGray),
      spacer(1),
      screenshotPlaceholder("Figure 5.2 – Visualisation of the sliding window extraction process on a sample Mario level. Show the 16×16 window moving across the full level with stride=8 annotations."),
      spacer(1),

      heading2("5.4 Tensor Compilation"),
      richPara([
        run("All validated 16×16 level chunks were compiled into the training tensor file "),
        run("mario_training_data.npy", { bold: true }),
        run(". This yielded "),
        run("1,269 strictly formatted int64 tensors", { bold: true }),
        run(", each of shape (16, 16), ready for direct ingestion by the PyTorch DataLoader."),
      ]),
      spacer(1),
      richPara([
        run("Each tensor was validated to ensure: (a) at least one row of Solid tiles exists at the bottom (enforcing platform physics), (b) no out-of-range token values, and (c) correct shape. Chunks failing validation were discarded."),
      ]),
      spacer(1),
      screenshotPlaceholder("Figure 5.3 – Visualisation of 4–6 sample compiled 16×16 tensor chunks rendered as coloured grids (e.g., blue=Air, brown=Solid, yellow=Loot, red=Enemy). Capture from your data visualisation notebook."),

      spacer(2),
      pageBreak(),

      // =============================================
      // SECTION 6: GAN — Abandoned Path
      // =============================================
      heading1("6. Phase 3 – Architectural Exploration: GAN (Abandoned Path)"),
      richPara([
        run("Before settling on the Transformer architecture, a "),
        run("Generative Adversarial Network (GAN)", { bold: true }),
        run(" approach was pursued as the initial candidate for level generation. This section documents the architectural design, the technical failures encountered, and the rationale for abandonment — a critical part of the scientific record."),
      ]),
      spacer(1),

      heading2("6.1 Initial GAN Architecture"),
      para("The GAN was designed with two adversarial components:"),
      spacer(1),
      richBullet([run("Generator (G): ", { bold: true }), run("Takes a random noise vector z concatenated with the 27-dimensional condition vector. Passes through transposed convolutional layers (deconvolution) to produce a 16×16 grid of tile logits — one logit vector per tile position.")]),
      richBullet([run("Discriminator (D): ", { bold: true }), run("Takes a 16×16 tile grid (real or generated) and classifies it as real (from the VGLC dataset) or fake (from the Generator). Uses convolutional layers followed by a sigmoid output.")]),
      spacer(1),
      richPara([
        run("The training objective was a standard minimax game: the Generator attempted to fool the Discriminator, while the Discriminator attempted to correctly distinguish real levels from generated ones."),
      ]),
      spacer(1),
      screenshotPlaceholder("Figure 6.1 – GAN architecture diagram showing the Generator and Discriminator networks. Alternatively: screenshot of the GAN model code (generator.py / discriminator.py)."),
      spacer(1),

      heading2("6.2 Technical Failure: Non-Differentiable Argmax"),
      richPara([
        run("The primary and fundamental failure was encountered at the output stage of the Generator. Tile maps are "),
        run("discrete, categorical data", { bold: true }),
        run(": each tile must be one of 6 integer tokens (0–5). Converting the Generator's continuous logit outputs to discrete tile tokens requires an "),
        run("argmax", { bold: true }),
        run(" operation — selecting the token with the highest probability."),
      ]),
      spacer(1),
      infoBox("The Argmax Problem", [
        "argmax is a non-differentiable function. Its gradient with respect to the input logits is zero almost everywhere",
        "and undefined at the boundary. This means that during backpropagation, the gradient signal from the Discriminator",
        "cannot flow back through the argmax into the Generator's weights.",
        "Result: the Generator receives zero gradient — it cannot learn from the Discriminator's feedback.",
        "The Generator's loss remains stagnant and the adversarial training loop breaks completely."
      ], COLORS.red, "C0392B"),
      spacer(1),

      heading2("6.3 Attempted Fix: Gumbel-Softmax"),
      richPara([
        run("To restore gradient flow through the discrete sampling step, the "),
        run("Gumbel-Softmax trick", { bold: true }),
        run(" (also known as the Concrete distribution) was implemented. Gumbel-Softmax approximates the argmax operation with a differentiable, temperature-controlled softmax, allowing the reparameterization trick to be applied to categorical variables."),
      ]),
      spacer(1),
      richPara([
        run("A "),
        run("1×1 Convolutional Layer", { bold: true }),
        run(" was added after the Gumbel-Softmax layer to map the approximate one-hot distributions to categorical-equivalent embeddings, further smoothing the gradient path. This partially restored learning signal, and training resumed."),
      ]),
      spacer(1),
      screenshotPlaceholder("Figure 6.2 – Code snippet or diagram showing the Gumbel-Softmax insertion into the Generator output pipeline. Alternatively: a plot of Generator loss before vs after the fix."),
      spacer(1),

      heading2("6.4 Mode Collapse & Strategic Abandonment"),
      richPara([
        run("Even with the Gumbel-Softmax gradient fix, a second and more severe problem emerged: "),
        run("mode collapse", { bold: true }),
        run(". The Generator converged to producing only a small set of nearly identical outputs — typically a flat row of Solid tiles — regardless of the input condition vector. This is a well-documented failure mode in GANs applied to structured, discrete domains."),
      ]),
      spacer(1),
      para("Root-cause analysis identified two contributing factors:"),
      richBullet([run("Physics blindness: ", { bold: true }), run("The GAN has no inherent understanding of platformer physics (e.g. gravity, the requirement for a solid floor, the spatial relationship between platforms and gaps). The Discriminator reward signal is too sparse to communicate these structural rules.")]),
      richBullet([run("Discrete domain unsuitability: ", { bold: true }), run("GANs are architecturally optimised for continuous data (images, audio). Tile maps are fundamentally discrete token sequences — a domain where autoregressive models have a proven structural advantage.")]),
      spacer(1),
      infoBox("Decision: Strategic Abandonment of GAN Path", [
        "After thorough analysis of mode collapse and the structural limitations of GANs for discrete tile sequences,",
        "the decision was made to pivot to an autoregressive Transformer architecture (Path B).",
        "This decision was driven by evidence, not convenience: the Transformer's token-by-token generation",
        "mechanism is inherently compatible with discrete categorical data and allows explicit spatial conditioning."
      ], COLORS.red, "C0392B"),
      spacer(1),
      screenshotPlaceholder("Figure 6.3 – Mode collapse visualisation: a grid of 4–6 generated level outputs from the trained GAN, all showing nearly identical flat/degenerate layouts. Capture from your GAN evaluation notebook."),

      spacer(2),
      pageBreak(),

      // =============================================
      // SECTION 7: Model B — Transformer
      // =============================================
      heading1("7. Phase 4 – Model B: Conditional Architect Transformer"),
      para("Following the abandonment of the GAN approach, a fully custom autoregressive Transformer was designed and implemented natively in PyTorch. This architecture was chosen for its proven capability in discrete sequence modelling and its native compatibility with conditional generation via cross-attention."),
      spacer(1),

      heading2("7.1 Autoregressive Transformer Design"),
      richPara([
        run("The "),
        run("ConditionalArchitectTransformer", { bold: true }),
        run(" generates 16×16 tile layouts one token at a time, in raster scan order (left-to-right, top-to-bottom). At each generation step, the model predicts the next tile token conditioned on all previously generated tiles and the condition vector derived from Model A's output."),
      ]),
      spacer(1),
      para("The key architectural components are:"),
      richBullet([run("Token Embedding Layer: ", { bold: true }), run("Maps each of the 6 tile tokens (integers 0–5) to a dense embedding vector.")]),
      richBullet([run("2D Positional Encoding: ", { bold: true }), run("Custom learnable row and column embeddings (see Section 7.2).")]),
      richBullet([run("Transformer Decoder Blocks: ", { bold: true }), run("Multi-head self-attention with causal masking (ensuring the model only attends to previously generated tokens) followed by feed-forward layers and layer normalisation.")]),
      richBullet([run("Condition Injection: ", { bold: true }), run("The 27-dimensional condition vector is projected and added to the token embeddings at each position, providing spatial intent at every generation step.")]),
      richBullet([run("Output Projection: ", { bold: true }), run("A linear layer maps the transformer hidden states to logits over the 6-token vocabulary. During inference, the token with the highest logit is selected (greedy decoding).")]),
      spacer(1),
      screenshotPlaceholder("Figure 7.1 – ConditionalArchitectTransformer architecture diagram or code screenshot (model.py) showing embedding layers, positional encoding, decoder blocks, and output head."),
      spacer(1),

      heading2("7.2 2D Positional Encoding"),
      richPara([
        run("Standard Transformer positional encodings (e.g. sinusoidal PE from the original 'Attention Is All You Need' paper) are designed for "),
        run("1D sequences", { bold: true }),
        run(". A tile map is a "),
        run("2D spatial structure", { bold: true }),
        run(": the model must understand not just order, but row proximity and column proximity simultaneously. A naive flattening of the 16×16 grid into a 256-element sequence loses this 2D spatial information."),
      ]),
      spacer(1),
      richPara([
        run("To solve this, a custom "),
        run("2D Positional Encoding layer", { bold: true }),
        run(" was developed using "),
        run("learnable row embeddings", { bold: true }),
        run(" and "),
        run("learnable column embeddings", { bold: true }),
        run(". For each tile at position (r, c) in the grid, the positional encoding is the sum of the row-r embedding and the column-c embedding. This encoding is added to the tile token embedding before processing by the transformer layers."),
      ]),
      spacer(1),
      infoBox("Why Learnable 2D Positional Encoding?", [
        "Row embeddings allow the model to associate token types with vertical positions (e.g. sky tokens appear in low row indices).",
        "Column embeddings allow the model to understand horizontal progression (e.g. platforms continue horizontally).",
        "Learnable (vs fixed sinusoidal) embeddings allow the model to discover the optimal spatial representation from the training data,",
        "rather than imposing a fixed mathematical prior that may not align with platformer physics."
      ], COLORS.green, "1E8449"),
      spacer(1),
      screenshotPlaceholder("Figure 7.2 – Code snippet showing the custom PositionalEncoding2D class (row_embed and col_embed learnable parameters, and the forward pass combining them)."),
      spacer(1),

      heading2("7.3 Auto-Annotation & Condition Vector"),
      richPara([
        run("To condition the transformer on the spatial intent expressed by Model A, each training chunk required a corresponding "),
        run("condition vector", { bold: true }),
        run(". An Auto-Annotation script was developed to generate these vectors from the ground-truth level chunks."),
      ]),
      spacer(1),
      para("The script operates as follows:"),
      numberedItem("A 3×3 grid (9 spatial zones: top-left, top-center, ..., bottom-right) is overlaid on the 16×16 chunk."),
      numberedItem("For each of the 3 entity categories (Enemy, Loot, Solid platforms), the proportion of tiles in each of the 9 zones is computed."),
      numberedItem("These 27 values (3 categories × 9 zones) are concatenated into a 27-dimensional floating-point vector."),
      numberedItem("This vector is paired with its corresponding ground-truth level chunk as a (condition_vector, tile_grid) training pair."),
      spacer(1),
      richPara([
        run("At inference time, the condition vector is derived from Model A's output JSON: entity positions are mapped to zones, and the spatial distribution is encoded into the same 27-dimensional format."),
      ]),
      spacer(1),
      screenshotPlaceholder("Figure 7.3 – Visualisation of the 3×3 zone overlay on a sample 16×16 chunk, with the resulting 27-dim condition vector values shown as a bar chart or heatmap."),
      spacer(1),

      heading2("7.4 Training & Loss Results"),
      richPara([
        run("The ConditionalArchitectTransformer was trained using GPU acceleration (CUDA). Training used the "),
        run("cross-entropy loss", { bold: true }),
        run(" between predicted tile logits and ground-truth tile tokens across all 256 positions of the 16×16 grid."),
      ]),
      spacer(1),
      richBullet([run("Final training loss: ", { bold: true }), run("~0.025 cross-entropy — indicating that the model assigns high probability to the correct tile token at each position.")]),
      richBullet([run("Convergence: ", { bold: true }), run("Loss decreased smoothly over training epochs without divergence or oscillation, confirming stable gradient flow through the 2D positional encoding and condition injection mechanism.")]),
      spacer(1),
      screenshotPlaceholder("Figure 7.4 – Model B training loss curve showing convergence to ~0.025. Capture from TensorBoard, W&B, or matplotlib. Also consider showing a few generated 16×16 grid samples mid-training vs final checkpoint."),

      spacer(2),
      pageBreak(),

      // =============================================
      // SECTION 8: End-to-End Integration
      // =============================================
      heading1("8. Phase 5 – End-to-End Pipeline Integration"),
      richPara([
        run("The final integration phase connected Model A and Model B into a single, unified inference script: "),
        run("end_to_end_test.py", { bold: true }),
        run(". This script accepts a raw natural language prompt and produces a complete 16×16 tile blueprint in a single forward pass through both models."),
      ]),
      spacer(1),
      para("The execution flow of the end-to-end script is:"),
      spacer(1),
      numberedItem("User provides a raw text prompt (e.g. \"In a lava cave, spawn 3 giant red fire dragons at the center and 2 skeletons on the left\")."),
      numberedItem("Model A's inference pipeline tokenizes, predicts IOB tags, and applies the post-processing engine to produce a structured JSON blueprint."),
      numberedItem("The Auto-Annotation logic encodes the JSON entity positions into a 27-dimensional condition vector."),
      numberedItem("The condition vector is fed into Model B (ConditionalArchitectTransformer). The model autoregressively generates all 256 tile tokens in raster order, producing a 16×16 tile matrix."),
      numberedItem("The tile matrix is validated (solid floor check, token range check) and output as a numpy array and/or JSON blueprint ready for the next stage."),
      spacer(1),
      infoBox("Key Achievement", [
        "The end_to_end_test.py script successfully bridges the semantic gap between free-form natural language and",
        "physically valid tile-based level geometry — with no manual intervention at any stage of the pipeline.",
        "Prompt-in → Level-out, fully automated."
      ], COLORS.green, "1E8449"),
      spacer(1),
      screenshotPlaceholder("Figure 8.1 – Terminal output of end_to_end_test.py showing: (1) the input prompt, (2) Model A JSON output, (3) the generated 27-dim condition vector, and (4) the final 16×16 tile matrix printed as a grid."),

      spacer(2),
      pageBreak(),

      // =============================================
      // SECTION 9: Final Output
      // =============================================
      heading1("9. Final Output & Scene Visualization"),
      richPara([
        run("The 16×16 tile blueprint produced by Model B is passed to a "),
        run("Blueprint-to-Scene Translator", { bold: true }),
        run(" — a Unity C# component that maps each integer token to its corresponding Unity prefab and instantiates it at the correct world coordinate. This step bridges the AI pipeline with the game engine."),
      ]),
      spacer(1),
      para("The token-to-prefab mapping is:"),
      spacer(1),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [1560, 2400, 5400],
        rows: [
          new TableRow({ children: [
            new TableCell({ borders, shading: { fill: COLORS.tableHeader, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 1560, type: WidthType.DXA },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Token", font: "Calibri", size: 20, bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders, shading: { fill: COLORS.tableHeader, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 2400, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: "Category", font: "Calibri", size: 20, bold: true, color: "FFFFFF" })] })] }),
            new TableCell({ borders, shading: { fill: COLORS.tableHeader, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 5400, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: "Unity Prefab / Action", font: "Calibri", size: 20, bold: true, color: "FFFFFF" })] })] }),
          ]}),
          ...([
            ["0", "Air", "No prefab instantiated (empty tile)"],
            ["1", "Solid", "Ground Tile Prefab (grass top + dirt body)"],
            ["2", "Loot", "Loot Block Prefab (coin or reward block)"],
            ["3", "Enemy", "Enemy Prefab (e.g. Goomba, skeleton — resolved from condition)"],
            ["4", "Climbable", "Vine / Ladder Prefab"],
            ["5", "Player", "Player Spawn Point (sets PlayerController world position)"],
          ]).map(([token, cat, prefab], i) => new TableRow({ children: [
            new TableCell({ borders, shading: { fill: i % 2 === 0 ? COLORS.white : COLORS.tableAlt, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 1560, type: WidthType.DXA },
              children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: token, font: "Courier New", size: 22, bold: true, color: COLORS.secondary })] })] }),
            new TableCell({ borders, shading: { fill: i % 2 === 0 ? COLORS.white : COLORS.tableAlt, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 2400, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: cat, font: "Calibri", size: 20, bold: true })] })] }),
            new TableCell({ borders, shading: { fill: i % 2 === 0 ? COLORS.white : COLORS.tableAlt, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, width: { size: 5400, type: WidthType.DXA },
              children: [new Paragraph({ children: [new TextRun({ text: prefab, font: "Calibri", size: 20, color: "333333" })] })] }),
          ]}))
        ]
      }),
      caption("Table 5 – Token-to-Unity-prefab mapping used by the Blueprint-to-Scene Translator"),
      spacer(1),
      para("The result is a fully rendered Unity 2D scene populated with pixel-art assets matching the AI-generated blueprint. The screenshot below shows a representative final output:"),
      spacer(1),
      // Final scene screenshot — this one we can reference as already provided
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [9360],
        rows: [
          new TableRow({
            children: [
              new TableCell({
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 8, color: COLORS.primary },
                  bottom: { style: BorderStyle.SINGLE, size: 8, color: COLORS.primary },
                  left: { style: BorderStyle.SINGLE, size: 8, color: COLORS.primary },
                  right: { style: BorderStyle.SINGLE, size: 8, color: COLORS.primary },
                },
                shading: { fill: COLORS.lightBlue, type: ShadingType.CLEAR },
                margins: { top: 200, bottom: 200, left: 200, right: 200 },
                width: { size: 9360, type: WidthType.DXA },
                children: [
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 80, after: 40 },
                    children: [
                      new TextRun({
                        text: "FIGURE 9.1 – FINAL UNITY SCENE OUTPUT",
                        font: "Calibri",
                        size: 22,
                        bold: true,
                        color: COLORS.primary,
                      }),
                    ],
                  }),
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 80 },
                    children: [
                      new TextRun({
                        text: "Insert the screenshot provided (Unity editor view showing grass-topped platforms, player character (blue), and enemy (red X) — generated from AI pipeline output)",
                        font: "Calibri",
                        size: 20,
                        italics: true,
                        color: "555555",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      caption("Figure 9.1 – Unity 2D scene generated by the complete Prompt-to-Scene pipeline. The scene shows: green-topped dirt platforms at varied heights, the blue player character spawned on the left platform, and a red enemy entity on the elevated center platform. Dark grid background shows the Unity tile editor view."),

      spacer(2),
      pageBreak(),

      // =============================================
      // SECTION 10: Conclusion
      // =============================================
      heading1("10. Conclusion & Future Work"),

      heading2("10.1 Summary of Achievements"),
      para("This project successfully designed, implemented, and validated a complete end-to-end AI pipeline for natural-language-driven 2D level generation. The key achievements are:"),
      spacer(1),
      richBullet([run("Model A: ", { bold: true }), run("A domain-specialized NER model achieving perfect precision/recall (F1 = 1.000) on game-domain entity extraction, with a robust post-processing engine for real-world input handling.")]),
      richBullet([run("Data Engineering: ", { bold: true }), run("A complete VGLC ingestion, standardisation, and spatial extraction pipeline producing 1,269 validated 16×16 training tensors.")]),
      richBullet([run("Architectural Learning: ", { bold: true }), run("A documented and evidence-based exploration of GAN architectures, including the identification of the argmax gradient barrier, Gumbel-Softmax remediation, and mode collapse — leading to the principled pivot to the Transformer architecture.")]),
      richBullet([run("Model B: ", { bold: true }), run("A custom ConditionalArchitectTransformer with 2D positional encoding and 27-dim spatial conditioning, achieving a final cross-entropy loss of ~0.025 on physically valid level generation.")]),
      richBullet([run("Full Pipeline: ", { bold: true }), run("A working end-to-end inference script bridging free-form English prompts to rendered Unity game scenes with no manual level authoring.")]),
      spacer(1),

      heading2("10.2 Limitations"),
      richBullet([run("Synthetic data distribution: ", { bold: true }), run("Model A's perfect accuracy reflects a controlled synthetic domain. Robustness to highly unusual or out-of-distribution natural language inputs should be evaluated with human-generated test cases.")]),
      richBullet([run("Single-chunk generation: ", { bold: true }), run("Model B generates one 16×16 chunk at a time. Multi-chunk level assembly with spatial continuity between chunks is not yet implemented.")]),
      richBullet([run("Asset specificity: ", { bold: true }), run("The condition vector encodes spatial distribution but not the specific object type (e.g. dragon vs skeleton). Model B does not distinguish between enemy subtypes — the Blueprint-to-Scene Translator must resolve this from Model A's JSON.")]),
      spacer(1),

      heading2("10.3 Future Work"),
      richBullet([run("Multi-chunk level assembly: ", { bold: true }), run("Extend Model B to generate full levels by chaining 16×16 chunks with shared edge context, enabling arbitrarily long level generation.")]),
      richBullet([run("Object-type-aware conditioning: ", { bold: true }), run("Expand the condition vector to include object subtype embeddings, allowing Model B to differentiate between enemy classes and loot types spatially.")]),
      richBullet([run("3D scene extension: ", { bold: true }), run("Adapt the pipeline for 3D level generation using voxel representations or 3D tile grids, extending the architecture to handle a third spatial dimension.")]),
      richBullet([run("Vision-to-Prompt feedback loop: ", { bold: true }), run("Develop a vision-to-prompt generator that analyses reference game screenshots and produces text descriptions, enabling the pipeline to learn from visual game examples directly.")]),
      richBullet([run("Evaluation metrics: ", { bold: true }), run("Develop quantitative evaluation metrics for generated levels: platform reachability (graph-based), difficulty rating (gap width, enemy density), and aesthetic diversity (tile entropy).")]),
      spacer(1),
      sectionDivider(),
      spacer(1),
      richPara([
        run("The Prompt-to-Scene Engine demonstrates that a hierarchical, purpose-built AI pipeline — combining specialised NLP and conditional generative modelling — can meaningfully automate creative game design tasks. The documented journey, including the failed GAN path, provides a rigorous scientific record of architectural decision-making under real engineering constraints.", { italic: true })
      ]),

    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
fs.writeFileSync('./Prompt_to_Scene_Scientific_Report.docx', buffer);  console.log('Report generated successfully!');
}).catch(err => {
  console.error('Error generating report:', err);
  process.exit(1);
});

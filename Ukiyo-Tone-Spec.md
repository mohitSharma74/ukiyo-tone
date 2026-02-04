# **Project Specification: Ukiyo-Tone (浮世トーン)**

## **1\. Vision & Concept**

**Ukiyo-Tone** is a premium VS Code theme bundle inspired by 17th-century Japanese Ukiyo-e woodblock prints and the visual aesthetic of the Edo period (as seen in *Blue Eye Samurai*). The goal is to translate the high-contrast, organic line work and mineral-pigment palettes of ancient Japanese art into a modern, highly functional developer environment.

## **2\. Extension Metadata**

* **Project Name:** Ukiyo-Tone  
* **DisplayName:** Ukiyo-Tone (浮世トーン)  
* **Description:** A four-theme bundle inspired by 17th-century Japanese Ukiyo-e art and mineral pigments.  
* **Publisher:** \[User-to-define\]  
* **Repository:** \[User-to-define\]  
* **Category:** Themes

## **3\. The Theme Bundle**

The extension contains four distinct themes:

1. **Asahi (旭 \- Morning Sun):** Light Theme. Inspired by fresh Washi paper and early morning light.  
2. **Tasogare (黄昏 \- Twilight):** Soft Dark Theme. Inspired by evening landscapes and faded indigo dyes.  
3. **Kuro-Sumi (黒墨 \- Black Ink):** Deep Dark Theme. Inspired by charcoal ink drawings and midnight shadows.  
4. **Kachi-iro (勝ち色 \- Victory Color):** High Contrast Dark. Inspired by the "lucky" deepest navy indigo worn by Samurai.

## **4\. Color Palettes & UI Mapping**

### **A. Asahi (Light Theme)**

*Core concept: High readability, organic paper feel.*

* **Background (Washi Paper):** \#F2EBD3  
* **Foreground (Sumi Ink):** \#264348  
* **Activity Bar Background:** \#E8E1C8  
* **Sidebar Background:** \#EBE4CC  
* **Syntax Highlighting:**  
  * Keywords: \#CB4042 (Shu Red)  
  * Strings: \#4F7942 (Pine Green)  
  * Functions: \#264348 (Indigo)  
  * Variables: \#8C5A3C (Clay Brown)  
  * Comments: \#A19A84 (Faded Ink)

### **B. Tasogare (Soft Dark Theme)**

*Core concept: Low eye strain, muted atmospheric tones.*

* **Background (Twilight Sky):** \#2D333B  
* **Foreground (Grey Mist):** \#ADB5BD  
* **Activity Bar Background:** \#22272E  
* **Sidebar Background:** \#22272E  
* **Syntax Highlighting:**  
  * Keywords: \#E0C1B3 (Soft Fleshtone/Beige)  
  * Strings: \#7AA2F7 (Water Blue)  
  * Functions: \#BB9AF7 (Lavender)  
  * Variables: \#E6C384 (Straw Yellow)  
  * Comments: \#636E7B (Shadow)

### **C. Kuro-Sumi (Deep Dark Theme)**

*Core concept: Dramatic contrast, vivid highlights.*

* **Background (Charcoal Ink):** \#1C1C1C  
* **Foreground (White Ash):** \#DCDCDC  
* **Activity Bar Background:** \#141414  
* **Sidebar Background:** \#181818  
* **Syntax Highlighting:**  
  * Keywords: \#FF5D62 (Vivid Vermilion)  
  * Strings: \#98BB6C (Young Bamboo)  
  * Functions: \#7E9CD8 (Crystal Blue)  
  * Variables: \#E6C384 (Old Gold)  
  * Comments: \#727169 (Ash Grey)

### **D. Kachi-iro (High Contrast Theme)**

*Core concept: Accessibility and sharp focus.*

* **Background (Warrior Indigo):** \#0D1117  
* **Foreground (Pure White):** \#FFFFFF  
* **Activity Bar Background:** \#05070A  
* **Sidebar Background:** \#090C10  
* **Syntax Highlighting:**  
  * Keywords: \#FF003C (Blood Red)  
  * Strings: \#00FFCC (Modern Teal)  
  * Functions: \#FFFF00 (Signal Yellow)  
  * Variables: \#FFFFFF (White)  
  * Comments: \#8B949E (Steel)

## **5\. Implementation Instructions for AI Agents**

### **Step 1: package.json**

Configure the contributes.themes array to include all four themes pointing to their respective JSON paths:

* ./themes/Asahi-color-theme.json  
* ./themes/Tasogare-color-theme.json  
* ./themes/KuroSumi-color-theme.json  
* ./themes/Kachiiro-color-theme.json

### **Step 2: UI Consistency**

* **Borders:** Use a subtle border of 1px for panes to mimic woodblock frame lines.  
* **Selection:** Use a semi-transparent version of \#CB4042 (Shu Red) to represent the red ink of an artist's signature stamp (*Hanko*).  
* **Terminal:** Ensure the ANSI colors are mapped to the palette (e.g., Red \-\> Shu Red, Blue \-\> Indigo).

### **Step 3: Syntax Refinement**

* Use **Italics** for comments and documentation to mimic hand-written calligraphy annotations.  
* Use **Bold** for Class names and Constants to provide the "structural" feel of the initial Sumi-e outlines.

**End of Specification**
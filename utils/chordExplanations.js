// ============ utils/chordExplanations.js ============
// 和弦功能/角色/调性说明数据
// 帮助学习者理解每个和弦在音乐中的用途

var CHORD_INFO = {

  // ──── C 系列 ────
  'C': {
    role: '主和弦（Tonic）',
    feeling: '明亮、稳定、结束感',
    keys: 'C大调（Ⅰ级）、F大调（Ⅴ级）、G大调（Ⅳ级）、Am的Ⅶ级',
    function: '最基础的大三和弦，几乎所有流行歌曲的起点。在C大调中充当主和弦，给人"回家"的感觉。',
    progression: 'C → F → G (Ⅰ-Ⅳ-Ⅴ，最经典的和弦进行)',
    songExample: '《月亮代表我的心》《小星星》',
  },
  'Cm': {
    role: '小调主和弦',
    feeling: '忧郁、深沉、柔和',
    keys: 'C小调（Ⅰ级）、Eb大调（Ⅵ级）、G小调（Ⅳ级）',
    function: '小三和弦具有忧郁色彩。C小调的主和弦，常用于悲情或深沉的歌曲段落。',
    progression: 'Cm → Ab → Bb → Eb (ⅰ-Ⅵ-Ⅶ-Ⅲ，卡农式小调进行)',
    songExample: '《贝加尔湖畔》部分段落',
  },
  'Cmaj7': {
    role: '大七和弦',
    feeling: '梦幻、温柔、爵士感',
    keys: 'C大调（Ⅰmaj7）、G大调（Ⅳmaj7）',
    function: '在C大调中是大调主七和弦，比普通C和弦多了一个B音，带来梦幻柔和的色彩，常用于Jazz和R&B。',
    progression: 'Cmaj7 → Am7 → Dm7 → G7 (Ⅱm7-Ⅴ7-Ⅰmaj7 爵士进行)',
    songExample: '《Fly Me to the Moon》',
  },
  'C7': {
    role: '属七和弦（Dominant 7th）',
    feeling: '不协和、有张力、渴望解决',
    keys: 'F大调（Ⅴ7）',
    function: '属七和弦带有强烈的解决倾向，C7通常解决到F和弦。Bb音制造了紧张感，弹完想接F和弦。',
    progression: 'C7 → F (Ⅴ7 → Ⅰ，标准属七解决)',
    songExample: '蓝调12小节进行中的C7',
  },
  'Cadd9': {
    role: '加九和弦',
    feeling: '温暖、开阔、民谣感',
    keys: 'G大调（Ⅳadd9）、C大调（Ⅰadd9）',
    function: '在C大三和弦的基础上加入D音（九度音），声音比普通C和弦更丰满，是民谣和流行歌中常用的色彩和弦。',
    progression: 'Cadd9 → G → D (流行歌经典和弦套子)',
    songExample: '《Tears in Heaven》《丁香花》',
  },

  // ──── D 系列 ────
  'D': {
    role: '属和弦（Dominant）或下属和弦',
    feeling: '明亮上行、充满能量',
    keys: 'D大调（Ⅰ级）、G大调（Ⅴ级）、A大调（Ⅳ级）、Bm的Ⅶ级',
    function: '在G大调中D是Ⅴ级属和弦，有强烈的指向G的倾向。在D大调中则是主和弦。指法上常用开放D，声音明亮。',
    progression: 'G → D → Em → C (Ⅴ-Ⅱm-Ⅳ进行)',
    songExample: '《老男孩》《光阴的故事》',
  },
  'Dm': {
    role: '小调和弦',
    feeling: '柔和、略带忧伤',
    keys: 'D小调（Ⅰ级）、C大调（Ⅱ级）、F大调（Ⅵ级）、Bb大调（Ⅲ级）',
    function: '在C大调中是Ⅱ级和弦（Dm→G7→C是标准251进行）。Dm是最常用的小调和弦之一。',
    progression: 'Dm → G7 → C (Ⅱm7-Ⅴ7-Ⅰ，标准251)',
    songExample: '《那些年》副歌中的Dm',
  },
  'Dm7': {
    role: '小七和弦（251中的Ⅱ级）',
    feeling: '柔和爵士感、过渡',
    keys: 'C大调（Ⅱm7）、F大调（Ⅵm7）、Bb大调（Ⅲm7）',
    function: '在C大调中是Ⅱm7，与G7和C构成最经典的Ⅱ-Ⅴ-Ⅰ进行。Dm7比Dm多了一个C音，音色更柔和。',
    progression: 'Dm7 → G7 → Cmaj7 (爵士251进行)',
    songExample: '几乎所有爵士标准曲',
  },
  'D7': {
    role: '属七和弦',
    feeling: '蓝调感、紧张',
    keys: 'G大调（Ⅴ7）',
    function: 'G大调中的Ⅴ7和弦，D7强烈倾向解决到G和弦。在蓝调中常用D7作为过渡和弦。',
    progression: 'D7 → G (Ⅴ7 → Ⅰ)',
    songExample: '12小节蓝调中的D7',
  },
  'Dsus2': {
    role: '挂二和弦',
    feeling: '空旷、开放、民族风',
    keys: 'D大调（Ⅰsus2）、A大调（Ⅳsus2）',
    function: '挂留和弦，用二度音E替代了三度音F#，少了大小调色彩，音色空旷纯净，常用于前奏和过渡。',
    progression: 'Dsus2 → D → G (sus解决到原和弦)',
    songExample: '《同桌的你》《夜空中最亮的星》前奏',
  },
  'Dsus4': {
    role: '挂四和弦',
    feeling: '悬空感、期待解决',
    keys: 'D大调（Ⅰsus4）',
    function: '用四度音G替代了三度音F#，制造悬空感，通常解决到D和弦。弹D和弦前先弹Dsus4是经典套路。',
    progression: 'Dsus4 → D (sus4解决到三和弦)',
    songExample: '《Hotel California》前奏',
  },

  // ──── E 系列 ────
  'E': {
    role: '主和弦 / 属和弦',
    feeling: '明亮有力、开放感',
    keys: 'E大调（Ⅰ级）、A大调（Ⅴ级）、B大调（Ⅳ级）、C#m的Ⅶ级',
    function: 'E大三和弦使用大量开放空弦，声音饱满。在A大调中是Ⅴ级，是摇滚和布鲁斯中最常用的和弦之一。',
    progression: 'E → A → B (Ⅰ-Ⅳ-Ⅴ 在E大调中)',
    songExample: '《Yellow》Coldplay、《真的爱你》Beyond前奏',
  },
  'Em': {
    role: '小调和弦',
    feeling: '忧伤但温暖',
    keys: 'E小调（Ⅰ级）、G大调（Ⅵ级）、D大调（Ⅱ级）、A小调（Ⅴ级）',
    function: '最常用的开放小调和弦之一。在G大调中是Ⅵ级（关系小调），是学习和弦进行时第一个接触的小调和弦。',
    progression: 'Em → C → G → D (Ⅵ-Ⅳ-Ⅰ-Ⅴ，万能和弦进行)',
    songExample: '《平凡之路》《南山南》',
  },
  'Em7': {
    role: '小七和弦',
    feeling: '柔和、民谣感',
    keys: 'G大调（Ⅵm7）、D大调（Ⅱm7）、A小调（Ⅴm7）',
    function: '比Em多了一个D音（七度），音色更柔和。在G大调中是Ⅵm7，常用于和弦替代。',
    progression: 'C → G/B → Am7 → Em7 (经典下行)',
    songExample: '《Tears in Heaven》前奏',
  },
  'E7': {
    role: '属七和弦',
    feeling: '蓝调感、推进',
    keys: 'A大调（Ⅴ7）、A小调（Ⅴ7）',
    function: 'A大/小调中的Ⅴ7和弦，E7到Am/A是经典的蓝调终止式。D音的加入使它比E和弦更有推向A的张力。',
    progression: 'E7 → Am (Ⅴ7 → ⅰ 在A小调)',
    songExample: '蓝调12小节中的E7、《爱的罗曼史》',
  },

  // ──── F 系列 ────
  'F': {
    role: '下属和弦',
    feeling: '温暖、明亮',
    keys: 'F大调（Ⅰ级）、C大调（Ⅳ级）、Bb大调（Ⅴ级）、Dm的Ⅶ级',
    function: '在C大调中是Ⅳ级下属和弦，是C→F→G和弦进行的核心之一。F的横按指法对初学者来说是个坎。',
    progression: 'C → F → G (Ⅰ-Ⅳ-Ⅴ 在C大调)',
    songExample: '《同桌的你》《小幸运》',
  },
  'Fmaj7': {
    role: '大七和弦',
    feeling: '柔和、爵士感',
    keys: 'C大调（Ⅳmaj7）、F大调（Ⅰmaj7）',
    function: '比F和弦多了一个E音（大七度），色彩由明亮变为柔和。在C大调中作为Ⅳmaj7，常用在和弦进行中替代F。',
    progression: 'Cmaj7 → Fmaj7 (Ⅰmaj7 → Ⅳmaj7)',
    songExample: '《The Girl from Ipanema》',
  },

  // ──── G 系列 ────
  'G': {
    role: '属和弦 / 主和弦',
    feeling: '饱满、阳光、开放',
    keys: 'G大调（Ⅰ级）、C大调（Ⅴ级）、D大调（Ⅳ级）、Em的Ⅶ级',
    function: '最常用的开放式大三和弦。在C大调中G是Ⅴ级，C→G是最基本的和弦进行。无数流行歌依赖G和弦。',
    progression: 'C → G → Am → F (流行歌Ⅰ-Ⅴ-Ⅵm-Ⅳ)',
    songExample: '《老男孩》《成都》',
  },
  'G7': {
    role: '属七和弦',
    feeling: '紧张、蓝调感',
    keys: 'C大调（Ⅴ7）',
    function: 'C大调中的Ⅴ7和弦，G7中的F音制造了强烈的解决倾向。G7→C是音乐中最基本的终止式，没有之一。',
    progression: 'G7 → C (Ⅴ7 → Ⅰ，标准属七解决)',
    songExample: '几乎所有音乐中的终止式',
  },
  'G/B': {
    role: '转位和弦（Slash Chord）',
    feeling: '低音下行、流动感',
    keys: 'C大调（Ⅴ/Ⅲ）、G大调（Ⅰ/Ⅲ）',
    function: 'G和弦的转位，低音是B而不是G。常用于C→G/B→Am的低音下行（C→B→A），让和弦进行更流畅。',
    progression: 'C → G/B → Am (低音下行 C B A)',
    songExample: '《Tears in Heaven》《童话》',
  },
  'Gm': {
    role: '小调和弦',
    feeling: '深沉、古典感',
    keys: 'G小调（Ⅰ级）、F大调（Ⅱ级）、Bb大调（Ⅵ级）、D小调（Ⅳ级）',
    function: '在F大调中Gm是Ⅱ级，常与C7和F构成Ⅱ-Ⅴ-Ⅰ进行。Gm需要横按，是比较有挑战性的和弦。',
    progression: 'Gm → C7 → F (Ⅱm-Ⅴ7-Ⅰ 在F大调)',
    songExample: '《卡农》中的Gm段',
  },

  // ──── A 系列 ────
  'A': {
    role: '主和弦 / 属和弦',
    feeling: '明亮、有力',
    keys: 'A大调（Ⅰ级）、D大调（Ⅴ级）、E大调（Ⅳ级）、F#m的Ⅶ级',
    function: 'A大三和弦是吉他上最常用的和弦之一。在D大调中是Ⅴ级，开放A和弦的音色饱满明亮。',
    progression: 'A → D → E (Ⅰ-Ⅳ-Ⅴ 在A大调)',
    songExample: '《海阔天空》《加州旅馆》前奏',
  },
  'Am': {
    role: '小调主和弦 / 关系小调',
    feeling: '忧伤、抒情',
    keys: 'A小调（Ⅰ级）、C大调（Ⅵ级）、G大调（Ⅱ级）、D小调（Ⅴ级）',
    function: 'C大调的关系小调（Ⅵ级）。Am → F → C → G是非常经典的流行歌进行。Am是吉他手学习的第一个小调和弦。',
    progression: 'Am → F → C → G (Ⅵ-Ⅳ-Ⅰ-Ⅴ，最流行和弦进行)',
    songExample: '《平凡之路》《后来》《加州旅馆》',
  },
  'Am7': {
    role: '小七和弦',
    feeling: '柔和、R&B感',
    keys: 'C大调（Ⅵm7）、G大调（Ⅱm7）、A小调（ⅰm7）',
    function: '比Am多了一个G音（小七度），色彩更柔和。在C大调中作为Ⅵm7，是流行R&B中的常用替代和弦。',
    progression: 'Am7 → Dm7 → G7 (Ⅱm7-Ⅴ7-Ⅰmaj7变体)',
    songExample: '《No Woman No Cry》',
  },
  'A7': {
    role: '属七和弦',
    feeling: '蓝调感、推进',
    keys: 'D大调（Ⅴ7）、D小调（Ⅴ7）',
    function: 'D大/小调的Ⅴ7和弦，A7中的G音制造了强烈的解决倾向。12小节蓝调中A7是关键和弦。',
    progression: 'A7 → D (Ⅴ7 → Ⅰ 在D大调)',
    songExample: '12小节蓝调进行中的A7',
  },
  'Asus2': {
    role: '挂二和弦',
    feeling: '空旷、纯净、悬空',
    keys: 'A大调（Ⅰsus2）',
    function: '用B音替代C#音，去掉大小调色彩。声音空旷纯净，常用于前奏营造氛围。',
    progression: 'Asus2 → A (sus2解决到大三)',
    songExample: '《Hotel California》前奏',
  },
  'Asus4': {
    role: '挂四和弦',
    feeling: '悬空、期待',
    keys: 'A大调（Ⅰsus4）',
    function: '用D音替代C#音，制造悬空感，通常解决到A和弦。经典套路：Asus4 → A。',
    progression: 'Asus4 → A → Asus4 → A (交替制造流动感)',
    songExample: '《Stairway to Heaven》前奏',
  },

  // ──── B 系列 ────
  'Bdim': {
    role: '减三和弦',
    feeling: '紧张、不安、过渡',
    keys: 'C大调（Ⅶdim）、A小调（Ⅱdim）、G大调（Ⅶdim）',
    function: '在C大调中Bdim是Ⅶ级减三和弦，常用于过渡。减和弦由小三度叠置，音色紧张，通常快速经过后解决到C。',
    progression: 'Bdim → C (Ⅶdim → Ⅰ，半音上行解决)',
    songExample: '《All of Me》中的减和弦过渡',
  },
  'Bm': {
    role: '小调和弦',
    feeling: '暗淡、压抑',
    keys: 'B小调（Ⅰ级）、A大调（Ⅱ级）、G大调（Ⅲ级）、D大调（Ⅵ级）',
    function: '在A大调中是Ⅱ级，常用于A大调的和弦进行中。Bm横按是初学者面临的第一个大横按挑战。',
    progression: 'Bm → F#m → G → D (ⅱ-ⅵ-Ⅶ-Ⅳ 在A大调)',
    songExample: '《光辉岁月》《江南》前奏',
  },
  'B7': {
    role: '属七和弦',
    feeling: '紧张、西班牙风情',
    keys: 'E大调（Ⅴ7）、E小调（Ⅴ7）',
    function: 'E大/小调的Ⅴ7和弦，B7到Em是经典终止。B7常出现在西班牙风格的吉他曲中，用横按或开放指法。',
    progression: 'B7 → Em (Ⅴ7 → ⅰ 在E小调)',
    songExample: '《西班牙吉他曲》《Hotel California》结尾',
  },

  // ──── 降号系列 ────
  'Bb': {
    role: '大调和弦',
    feeling: '温暖、铜管感',
    keys: 'Bb大调（Ⅰ级）、F大调（Ⅳ级）、Eb大调（Ⅴ级）、Gm的Ⅶ级',
    function: '在F大调中是Ⅳ级。Bb需要大横按，对初学者有挑战。常用于爵士、Funk和管乐编曲中。',
    progression: 'Bb → F → C (Ⅳ-Ⅰ-Ⅴ 在F大调)',
    songExample: '爵士标准曲中的Bb和弦',
  },
  'F#m': {
    role: '小调和弦',
    feeling: '神秘、暗淡',
    keys: 'F#小调（Ⅰ级）、A大调（Ⅵ级）、D大调（Ⅲ级）、E大调（Ⅱ级）',
    function: '在A大调中是Ⅵ级，和A构成关系大小调。F#m是横按和弦，常在Key of D和Key of A的歌曲中出现。',
    progression: 'F#m → Bm → E → A (ⅵ-ⅱ-Ⅴ-Ⅰ 在A大调)',
    songExample: '《安静》周杰伦',
  },
  'Ebm': {
    role: '小调和弦',
    feeling: '阴暗、压抑',
    keys: 'Eb小调（Ⅰ级）、Gb大调（Ⅵ级）',
    function: '较少见的调性的小调和弦，常用于转调段落或需要特殊情感的曲子中。常用横按在6品位置。',
    progression: 'Ebm → Ab → Db (ⅰ-Ⅳ-Ⅶ 在Eb小调)',
    songExample: '某些古典和爵士乐曲',
  },
  'Abm': {
    role: '小调和弦',
    feeling: '深沉、暗淡',
    keys: 'Ab小调（Ⅰ级）、B大调（Ⅵ级）',
    function: '升F大调的关系小调。在吉他上常用横按指法，较少出现的调性。',
    progression: 'Abm → E → B (ⅰ-Ⅵ-Ⅲ 在Ab小调)',
    songExample: '少数爵士和流行曲',
  },
  'Bbm': {
    role: '小调和弦',
    feeling: '阴暗、厚重',
    keys: 'Bb小调（Ⅰ级）、Db大调（Ⅵ级）',
    function: 'Db大调的关系小调。常用横按在6品或1品位置，对指力要求较高。',
    progression: 'Bbm → Eb → Ab (ⅰ-Ⅳ-Ⅶ 在Bb小调)',
    songExample: '现代流行曲中的转调段落',
  },

  // ──── 扩展类型（无特定根音的解释） ────
  'TYPE_dim': {
    role: '减三和弦',
    feeling: '紧张、不安、过渡',
    function: '由两个小三度叠置而成（根音→小三度→减五度）。音色极度紧张，常用于过渡和连接和弦，通常快速解决到目标和弦。',
    progression: '根音上方的半音 → 解决到目标和弦',
  },
  'TYPE_aug': {
    role: '增三和弦',
    feeling: '悬空、梦幻、不协和',
    function: '由两个大三度叠置而成（根音→大三度→增五度）。增三和弦没有明确的方向感，常用于制造梦幻或悬空氛围。',
    progression: '常用于转调桥梁或爵士乐中的过渡',
  },
  'TYPE_sus2': {
    role: '挂二和弦',
    feeling: '空旷、纯净、无色彩',
    function: '用大二度音替代三度音，去掉了大小调特征，声音空旷纯净。常用于前奏和过渡段落，制造开放感。',
    progression: '常解决到同级大三和弦（sus2 → 大三）',
  },
  'TYPE_sus4': {
    role: '挂四和弦',
    feeling: '悬空、期待解决',
    function: '用纯四度音替代三度音，制造强烈的悬空感。听众会期待它解决到三度音。经典套路是sus4 → 大三和弦。',
    progression: 'sus4 → 大三和弦（解决）',
  },
  'TYPE_7sus4': {
    role: '属七挂四和弦',
    feeling: '蓝调感 + 悬空',
    function: '属七和弦的挂四版本，既有属七的张力又有挂留的悬空感。常用于Funk和Soul音乐。',
    progression: '7sus4 → 7 → Ⅰ（分步解决）',
  },
  'TYPE_m7b5': {
    role: '半减七和弦（251中的Ⅱ级）',
    feeling: '阴暗、复杂、爵士感',
    function: '在小调251进行中作为Ⅱ级（Ⅱm7b5→Ⅴ7→ⅰm）。由减三和弦加小七度构成，在小调中非常重要。',
    progression: 'Ⅱm7b5 → Ⅴ7 → ⅰm（小调251）',
  },
  'TYPE_add9': {
    role: '加九和弦',
    feeling: '温暖、开阔、色彩感',
    function: '在大三和弦基础上加入大九度音，使声音更丰满温暖。广泛用于民谣、流行和摇滚中。',
    progression: 'Ⅳadd9 → Ⅰ 或 Ⅰadd9 → Ⅳ',
  },
  'TYPE_m7': {
    role: '小七和弦（251中的Ⅱ级）',
    feeling: '柔和、爵士感',
    function: '在小七和弦基础上加入小七度，是大调251进行中Ⅱ级的标配。比小三和弦更柔和，更具现代感。',
    progression: 'Ⅱm7 → Ⅴ7 → Ⅰmaj7（标准大调251）',
  },
  'TYPE_maj7': {
    role: '大七和弦',
    feeling: '梦幻、温柔、爵士感',
    function: '在大三和弦基础上加入大七度，比普通大三和弦多了一层梦幻色彩。是Jazz和Bossa Nova的标志性和弦。',
    progression: 'Ⅰmaj7 → Ⅳmaj7 → Ⅱm7 → Ⅴ7',
  },
  'TYPE_m9': {
    role: '小九和弦（高级色彩）',
    feeling: '丰富、复杂、爵士感',
    function: '在小七和弦基础上再加入九度音。比小七和弦更丰富，常用于高端爵士和声。',
    progression: 'Ⅱm9 → Ⅴ13 → Ⅰmaj9',
  },
  'TYPE_6': {
    role: '大六和弦',
    feeling: '轻松、复古、爵士感',
    function: '在大三和弦基础上加入大六度音。听起来比大七和弦更轻松复古，常见于Swing和早期爵士乐。',
    progression: 'Ⅰ6 → Ⅳ6 → Ⅱm7 → Ⅴ7',
  },
  'TYPE_m6': {
    role: '小六和弦',
    feeling: '忧郁、电影感',
    function: '在小三和弦基础上加入大六度音。色彩独特，介于小调和弦和多利亚调式之间。',
    progression: 'ⅰm6 → Ⅳ7 → Ⅴ7',
  },
};

// 获取和弦说明（根据根音和类型）
function getChordExplanation(root, type) {
  // 类型映射用
  var typeClean = type.replace('major', '').replace('minor', 'm');
  var chordName = root + typeClean;

  // 优先查具体和弦
  if (CHORD_INFO[chordName]) {
    return CHORD_INFO[chordName];
  }

  // 没有精确匹配，查类型通用说明
  var typeKey = 'TYPE_' + typeClean;
  if (CHORD_INFO[typeKey]) {
    return CHORD_INFO[typeKey];
  }

  // 大调三元组
  if (type === 'major' || type === '') {
    return {
      role: '大三和弦（Major Triad）',
      feeling: '明亮、稳定',
      function: root + '大三和弦由根音、大三度、纯五度构成，是最基本的和弦类型。在"怎么学吉他"中学习它是理解其他和弦的基础。',
      progression: root + ' → 四度上行 → 五度下行（和弦循环）',
    };
  }

  // 小调三元组
  if (type === 'minor' || type === 'm') {
    return {
      role: '小三和弦（Minor Triad）',
      feeling: '柔和、忧郁',
      function: root + '小三和弦由根音、小三度、纯五度构成。和大三和弦相比，三度降低了半音，带来忧郁的色彩。',
      progression: root + 'm → ' + root + 'm7 → ' + root + 'm6（扩展学习）',
    };
  }

  return null;
}

module.exports = {
  CHORD_INFO: CHORD_INFO,
  getChordExplanation: getChordExplanation,
};

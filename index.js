define(["require", "exports", "./moduls/point"], function (require, exports, point) {
    "use strict";
/**коэффициент увеличения размера*/
const koef = screen.width / 1100;
/**высота шапки браузера браузера */
const topSizeMenuBrowser = 60;
/**y для точки левого верхнего угла*/
//ДОЛЖНО БЫТЬ ПРИВЯЗАНО К МЕНЮ СЛЕВА И МЕНЮ СВЕРХУ
const h = 50;
/**x для точки верхнего левого угла*/
const w = 240;
/**желаемый размер поля*/
//const widthSizePaper = document.body.offsetWidth - w + 16;
const heightSizePaper = ((screen.height - h) / 1) - h - topSizeMenuBrowser;
/**холст */
const art = document.getElementById('art');
const m = document.getElementById('menu');
let div_for_paper = art.style.height = (heightSizePaper - 29) + 'px';
let paper = Raphael('art');
//границы меню
m.style.height = (heightSizePaper - 29) + 'px';
/**границы поля */
const myfill = paper.rect(0, 0, art.offsetWidth, art.offsetHeight).attr('fill', '#666').attr('stroke', '#101010');
/**набор объектов*/
const mySet = paper.set();

//глобальная переменная нумерации
let gl_num = 0;

//ЛИНИИ

//массив из элементов класса - линия
let setLines = [];
//класс линии, ничем сама не управляет, ею управляют её функции, доступные остальным
class Line{
    /**
     * Создаёт линию и связывает её с двумя образами
     * @param {point} point_from координаты образа родителя
     * @param {string} strnum_from уникальный номер родителя
     * @param {point} point_to кординаты образа потомка
     * @param {string} strnum_to уникальный номер потомка
     */
    constructor(point_from, strnum_from, point_to, strnum_to){
        this.line = paper.path( ["M", point_from.x, point_from.y, "L", point_to.x, point_to.y ] ).toBack();
        this.pathArray = this.line.attr("path");
        this.from = strnum_from;
        this.to = strnum_to;
        this.pointf = point_from;
        this.pointt = point_to;
    }
    /**
     * Изменить координаты начала или конца
     * @param {number} x текущая координата движимого образа
     * @param {number} y текущая координата движимого образа
     * @param {number} i 0 or 1, if 0 -- begin
     */
    change_coord(x,y,i){
        this.pathArray[i][1] = x;
        this.pathArray[i][2] = y;
        this.line.attr({path: this.pathArray});
    }
    /**
     * Изменить координаты начала или конца
     * @param {number} parent_num имя родителя
     * @param {point} point_to координата родителя
     */
    change_parent(parent_num,point_to){
        this.from = strnum_to;
        this.pointf = point_to;
    }
}

//ОПИСАНИЕ ПЕРЕМЕЩЕНИЯ

/**опишем, как будут перемещаться объекты
 * lx изменение положения мыши в данный момент времени по х
 * ly изменение положения мыши в данный момент времени по х
 * ox положение элемента по х
 * oy положение мыши в момент захвата по y
 */
Raphael.st.draggable = function(point,form) {
    let me = this,
        lx = 0,
        ly = 0,
        ox = 0,
        oy = 0,
        moveFnc = function(dx, dy) {
            lx = dx + ox;  // изменяем значение трансформации по x
            ly = dy + oy;  // делаем тоже самое для y
            me.transform('t' + lx + ',' + ly);
            form.array_with_my_lines[0].change_coord(form.my_point.x + lx, form.my_point.y + ly, 1);
            for (let i = 1; i < form.count_sons + 1; i++){
                if (form.array_with_my_lines[i] !== null)
                    form.array_with_my_lines[i].change_coord(form.my_point.x + lx, form.my_point.y + ly, 0);
            };
        },
        startFnc = function() {},
        endFnc = function() {
            ox = lx;
            oy = ly;
            point.x = ox;
            point.y = oy;
        };
    this.drag(moveFnc, startFnc, endFnc); 
}

//ОБЪЕКТ РЕДАКТОР
function Redactor() {
    /**Объявление редактора */
    //обозначить отключённость редактора
    this.isOpen = false;    //нет смысла, можно проверить через myform
    this.str_uniqNum = ''; //смогу получать доступ через myform -- что тогда делать с проверками?!
    this.base_set = null;
    this.moving_set = null;
    this.bbox = null;
    this.count_els_in_mv_set = 0;
    this.myform = null;

    //функция изменения причастности (изменение привязанности)
    /**открытие редактора*/
    this.open = function(form_el, bset, mset, x, y, pC, bbox, i){
        this.base_set = bset;
        this.moving_set = mset;
        this.bbox = bbox;
        this.count_els_in_mv_set = i + 1;
        this.str_uniqNum = form_el.unum;
        this.myform = form_el;
        this.add_all_icons_in_set(x, y, pC);
    }
    /**закрытие редактора*/
    this.close = function(){
        this.del_icon_menu(this.count_els_in_mv_set - 1); //5 (последнее) -- положение icons_menu в наборе
        this.isOpen = false;    //нет смысла, можно проверить через myform
        this.str_uniqNum = ''; //смогу получать доступ через myform -- что тогда делать с проверками?!
        this.base_set = null;
        this.moving_set = null;
        this.bbox = null;
        this.count_els_in_mv_set = 0;
        this.myform = null;

        //отчистка div элемента от вероятного окна ввода
        let div_elem1 = document.getElementById('for_adding_input');
        if (div_elem1) div_elem1.innerHTML = "";
        let div_elem2 = document.getElementById('for_adding_input2');
        if (div_elem2) div_elem2.innerHTML = "";
    }
    //обозначить включённость редактора
    //обозначить отключённость редактора

    //ФУНКЦИИ УПРАВЛЕНИЯ

    /**
     * Добавление всех наборов иконок в главный набор обозначающий основной элемент
     * @param {RaphaelSet} base_set набор содержащий все части основного элемента
     * @param {number} x координата х для левого края иконки
     * @param {number} y координата у для левого края иконки
     * @param {point.default} pC разница в координатах между созданием объекта и текущим его положением
     * @param {*} base_set набор с образом
     * @param {*} set набор из движимых элементов
     */
    this.add_all_icons_in_set = function(x, y, pC){
        let all_icons = paper.set();
        /**Ширина иконка */
        const wIcon = 30;//39;
        /**Высота иконка */
        const hIcon = 23;//30;
         
        /**Ссылка на картинку-иконку */
        let srcs = [
                'images/redactor_text.svg', /**иконка редактора текста */
                'images/redactor_input_img.svg', /**иконка вставки картинки */
                'images/redactor_color.svg' /**иконка изменения цвета */
            ];
        if (this.myform.unum !== 0)
            srcs.push('images/redactor_del.svg'); /**иконка удаления */

        //добавить иконки
        for (let i = 0; i < srcs.length; i++){
            this.add_icons_in_set(x, y + i*hIcon, wIcon, hIcon, srcs[i], i, all_icons, pC);
        };
        //переместить меню к главному объекту, если главный объект был сдвинут с места создания
        all_icons.translate(pC.x, pC.y);
        //вставка набора иконок в основной набор
        this.moving_set.push(all_icons);
    }
    /**
     * Функция удаления меню из образа
     * @param {number} index какой элемент вытащить из набора
     */
    this.del_icon_menu = function(index){
        /**вытащить из набора набор с иконками */
        let item = this.moving_set.items.splice(index,1);
        //для каждой иконки
        item.forEach(
            function(icons_of_item){
                icons_of_item.remove();
            }
        );

    };

    //ВЛОЖЕННОСТЬ УРОВНЯ 2
    /**
     * Добавление иконки в набор
     * @param {number} x координата х для левого края иконки
     * @param {number} y координата у для левого края иконки
     * @param {number} wIcon размер иконки по ширине
     * @param {number} hIcon размер иконки по высоте
     * @param {string} src ссылка на картинку иконки
     * @param {number} index номер картинки
     * @param {RaphaelSet} set_for_pushing набор, куда будем складывать созданные элементы
     * @param {point.default} pC разница в координатах между созданием объекта и текущим его положением
     * @param {*} base_set набор с образом
     * @param {*} set набор из движимых элементов
     * @param {*} bbox коробка набора
     */
    this.add_icons_in_set = function(x, y, wIcon, hIcon, src, index, set_for_pushing, pC){
        /**текущая точка*/
        let point_с = new point.default(pC.x, pC.y);
        /**иконка для открытия меню будет чекбоксом */
        let checked_icon_menu = false;
        /**набор для цветов */
        let set = paper.set();

        /**набор с элементами иконки */
        let icon = paper.set();
        /**Подложка */
        let fill = paper.rect(x,y,wIcon,hIcon).attr({"fill": '#fff', 'stroke': this.myform.my_color, "stroke-width": 1});
        /**картинка */
        let image = paper.image(src,x,y,wIcon,hIcon);

        icon.push(fill);
        icon.push(image);

        let copyThis = this;

        let del_element;

        //При клике на картинку делать:
        image.click( function() {
            let parent_div1 = document.getElementById('for_adding_input').innerHTML;
            let parent_div2 = document.getElementById('for_adding_input2').innerHTML;
            //если закрыто -- открыть, если открыто, закрыть
            if (!checked_icon_menu || (index === 1 && parent_div2 === '') || (index === 0 && parent_div1 === '')){
                if ((index === 1 && parent_div2 !== '')
                || (index === 0 && parent_div1 !== '')){
                    checked_icon_menu = copyThis.del_menu_after_click_on_icon(del_element,index);
                }else{
                    //вызвать функцию события при клике на иконку
                    del_element = copyThis.event_click_on_icon(x, y, wIcon, hIcon, index);
                    if (index === 2){
                        set = del_element.translate(pC.x, pC.y);
                        icon.push(set);
                        checked_icon_menu = true;
                    }
                }
            }else{
                checked_icon_menu = copyThis.del_menu_after_click_on_icon(del_element,index);
            }
        });
        set_for_pushing.push(icon);
    }

    //ВЛОЖЕННОСТЬ УРОВНЯ 3
    /**
     * Тело события при нажатии на иконку из меню
     * @param {number} x координата х для левого края иконки
     * @param {number} y координата у для левого края иконки
     * @param {number} wIcon размер иконки по ширине
     * @param {number} hIcon размер иконки по высоте
     * @param {number} index номер иконки
     */
    this.event_click_on_icon = function(x, y, wIcon, hIcon, index) {
        //Make case
        if (index === 0){
            //const posx = widthSizePaper - bbox.width / 2 - bbox.x;
            //const posy = heightSizePaper - bbox.height / 2 - bbox.y;

            let d = document.createElement('div');
            d.innerHTML = 'Ваш текст для '+this.str_uniqNum+': ';
            document.getElementById('for_adding_input').appendChild(d);

            const button = document.createElement('button');
            button.className='button_agree';
            button.innerText= 'OK';
            const button_bold = document.createElement('button');
            button_bold.innerHTML = "B";
            button_bold.className = 'button_bold padding_tb';
            let newInput = document.createElement('input');
            let slct = document.createElement('select');
            slct.className = 'slct_style';
            
            let opt1 = document.createElement('option'); slct.appendChild(opt1);
            let opt2 = document.createElement('option'); slct.appendChild(opt2);
            let opt3 = document.createElement('option'); slct.appendChild(opt3);
            let opt4 = document.createElement('option'); slct.appendChild(opt4);
            let opt5 = document.createElement('option'); slct.appendChild(opt5);

            //возьмём из html индекс выбранного по умолчанию option из стандартных настроек, выставленных пользователем
            const std_slct = document.getElementById("standart_slct");
            const ind = std_slct.selectedIndex;
            
            //количество option должно совпадать! 
            if (slct.options.length !== std_slct.options.length) alert('Количество option не совпадает');

            for (let i = 0; i < slct.options.length; i++){
                if (i === ind)
                    //нужному option присвоим атрибут селектед
                    slct.options[ind].selected = 'selected';
                else
                    slct.options[i].selected = undefined;
            }

            opt1.value="12"; opt1.innerText = "12";
            opt2.value="14"; opt2.innerText = "14";
            opt3.value="16"; opt3.innerText = "16";
            opt4.value="18"; opt4.innerText = "18";
            opt5.value="20"; opt5.innerText = "20";

            newInput.style.width='100px';
            newInput.style.height='20px';
            newInput.type='text';

            d.appendChild(newInput);
            d.appendChild(button);
            d.appendChild(button_bold);
            d.appendChild(slct);
            
            let copyThis = this;

            button_bold.pressed = std_butt.pressed;
            if (button_bold.pressed){
                button_bold.className ='clicked_bold';
            }else{
                button_bold.className ='button_bold';
            }

            button_bold.onclick = function(){
                if (!button_bold.pressed){
                    button_bold.className ='clicked_bold';
                    button_bold.pressed = true;
                }else{
                    button_bold.className ='button_bold';
                    button_bold.pressed = false;
                }
            };
            button.onclick = function(){
                let end = copyThis.count_els_in_mv_set;
                //выдираем текст из набора всех элементов образа кроме перемещения
                let txt = copyThis.moving_set.items.splice(0, end);
                //функция изучения текста и разбиения его на строчки, возвращает массив, его длина будет говорить о сдвиге наверх
                const new_text = check_text(newInput.value);
                //2 - место, занимаемое текстовым элементом
                //С помощью данной строчки можно изменять текст внутри
                txt[2].attr({text: new_text, fill: '#000', 'font-size': slct.value});
                if (button_bold.pressed) {
                    txt[2].attr({'font-weight': 'bold'});
                } else {
                    txt[2].attr({'font-weight': 'normal'});
                }
                //возвращаем выдернутые элементы
                for (let i = 0; i < end; i++)
                    copyThis.moving_set.push(txt[i]);
            };
            return true;
        }
        //если нажата кнопка картинки, то открываем окно для ввода ссылки на файл
        if (index === 1){

            let label = document.createElement('label');
            let div1 = document.createElement('div');
            let div2 = document.createElement('div');
            let input = document.createElement('input');

            label.className = 'uploadbutton';
            div1.className = 'button';
            div2.className = 'input';
            input.type = 'file';

            div1.innerHTML = 'Выбрать';
            div2.innerHTML = 'Выберете файл для '+this.str_uniqNum;
            div2.id = 'div2_id';
            
            input.addEventListener(
                'change',
                function() { 
                    let t = replacer(this.value)
                    div2.innerHTML = t;
                },
                false
            );

            document.getElementById('for_adding_input2').appendChild(label);
            label.appendChild(div1);
            label.appendChild(div2);
            label.appendChild(input);
            

            return true;
        }
        //При клике на иконку с цветом должен появиться ряд цветов для выбора,
        //каждый из которых может быть нажат, чтобы изменить аттрибуты круга и треугольника
        if (index === 2){
            let icon_set = paper.set();
            const colors = ['red','#c33','#cc33aa','green','#11bb66','#4bf','blue','#bbbb66','#000'];
            y -= 2*hIcon;
            x += wIcon + 5;
            hIcon /= 1.5;
            wIcon /= 2;
            for (let i = 0; i < colors.length; i++){
                //находясь на иконке цвета мы имеем "y" такой,
                //что он находится на уровне этой иконки,а мы хотим цвета расположить сверху вниз от начала
                let fill = this.create_fill_for_icon_color(x,y + i*hIcon,wIcon,hIcon,colors[i]);
                icon_set.push(fill);
            }
            return icon_set;
        }
        if (index === 3){
            if (this.myform.count_sons === 0) {
                this.myform.parent.count_sons-=1;
                
                let p = this.myform.parent.array_with_my_lines[this.myform.i_am_son_number];
                p.line.remove();
                p === null;
                this.myform.array_with_my_lines[0].line.remove();
                this.myform.array_with_my_lines[0] === null;
            }else{

            }

            this.base_set.forEach(
                function(el){
                    el.remove();
                }
            );

            this.close();

            return false;
        }
    }
    /**
     * Закрытие дополнительных окон, открытых после нажатия на основные кнопки редактора
     * @param {*} del_element набор с палитрой
     * @param {*} index номер открытого меню, которое надо закрыть
     */
    this.del_menu_after_click_on_icon = function(del_element,index){
        if (index === 0){
            document.getElementById('for_adding_input').innerHTML = "";
        }
        if (index === 1){
            document.getElementById('for_adding_input2').innerHTML = "";
        }
        if (index === 2){
            del_element.forEach(function(color){
                color.remove();
            });
        }
        return false;
    }

    //ВЛОЖЕННОСТЬ УРОВНЯ 4
    /**
     * Создание цветового квадратика
     * @param {number} x координата х для левого края иконки
     * @param {number} y координата у для левого края иконки
     * @param {number} wIcon размер иконки по ширине
     * @param {number} hIcon размер иконки по высоте
     * @param {string} attribute выбранный цвет
     */
    this.create_fill_for_icon_color = function(x,y,wIcon,hIcon,attribute){
        let copyThis = this;
        let fill = paper.rect(x,y,wIcon,hIcon).attr({"fill": attribute, "stroke-width": 0});

        fill.click( function() {
            //изменение цвета образа
            change_color(copyThis.myform, copyThis.moving_set, attribute);
        });

        return fill;
    }

    //ЛОКАЛЬНЫЕ ФУНКЦИИ

    //подготовка текста для образа
    function check_text(text){
        let re = new RegExp('\  ','g');
        text = text.replace(re,'\n');
        return text;
    }

    //ОБЪЯВЛЕНИЕ ПРИЗНАКОВ
        /**состояние редактора */
        //isOpen;
        /**строка причастности */
        //str_uniqNum;
        /**набор с образом (главный) */
        //base_set;
        /**набор из движимых элементов */
        //moving_set;
        /**номер, занимаемый элементом - набор элементов редактора */
        //index
};


//КЛАСС ОБРАЗ
class Form{
    //создание образа
    //уникальный номер по умолчанию для центрального образа - 1
    constructor(cursor_x = art.offsetWidth/2, cursor_y = art.offsetHeight/2, parent = null)
    {
        //ОБЪЯВЛЕНИЕ ЛОКАЛЬНЫХ ПЕРЕМЕННЫХ

        /**текущая точка*/
        let pointEl = new point.default(0, 0);
        /**сдвиг */
        const shift_y = -50;
        const sizeCircle = 50;
        const sc_and_hh = 50;
        const size_icon_move = 26;
        const half_sim = size_icon_move / 2;
        const size_icon_add_h = 30;
        const size_icon_add_w = 13;
        const half_siah = size_icon_add_h/2;
        const half_siaw = size_icon_add_w/2;

        //ВСПОМОГАТЕЛЬНЫЕ ПЕРЕМЕННЫЕ
        /**координата у, полученная путём сложения текущего места курсора и сдвига */
        let y_cur_sh = cursor_y + shift_y;
        /**координата у, полученная путём сложения текущего места курсора и сдвига за вычетом размера круга */
        let y_cur_sh_sc = y_cur_sh - sizeCircle;

        //ИНИЦИАЛИЗАЦИЯ ПРИЗНАКОВ ОБРАЗА

        //если нет родителя, то это центральный элемент
        if (parent === null){
            /**уникальная строка с номером образа*/
            this.unum = gl_num;
        }else{
            this.unum = gl_num+=1;//parent.unum + '.' + parent.count_sons;
            parent.count_sons += 1;
            this.i_am_son_number = parent.count_sons;
        }
        /**количество сыновей образа */
        this.count_sons = 0;
        /**цвет формы */
        this.my_color = '#000';
        this.my_point = new point.default(cursor_x, y_cur_sh);
        this.parent = parent;
        this.array_with_my_lines = [];

        if (parent === null) {
            this.array_with_my_lines[0] = new Line(0,0,0,0);
        };

        //СОЗДАНИЕ ЭЛЕМЕНТОВ

        //let c = paper.ellipse(cursor_x, y_cur_sh, 50, 50);
        
        /*в Рафаэль библиотеки нет родителей и сыновей,
        поэтому нужно делать группы элементов, содержащих в себе в нулевых позициях текст и элемент
        */
        let base = paper.set();
        let rectEl = paper.rect(cursor_x, y_cur_sh_sc,sizeCircle,sizeCircle).attr({'fill': '#000000', 'stroke': '#000000', "stroke-width": 1});
        let circEl = paper.circle(cursor_x, y_cur_sh , sizeCircle).attr({'fill': '#ffffff', 'stroke': '#000000', "stroke-width": 1});
        //let icon_add = paper.image('images/icon_add.svg',cursor_x - sc_and_hh - size_icon_add_w, y_cur_sh - half_siah,size_icon_add_w,size_icon_add_h);
        //доп. расчёты
        let cxia = cursor_x - sizeCircle*0.85;
        let cyia = y_cur_sh - sizeCircle*0.85;

        let set_ic_add = paper.set();
        let icon_add = paper.circle(cxia, cyia, sizeCircle/5.5).attr({'fill': '#ffffff', 'stroke': '#000000', "stroke-width": 1});
            let vertical_line = paper.path( ["M", cxia - 5, cyia, "L", cxia + 5, cyia ] ).attr({"stroke-width": 2});
            let horizontal_line = paper.path( ["M", cxia, cyia - 5, "L", cxia, cyia + 5 ] ).attr({"stroke-width": 2});
        set_ic_add.push(icon_add, vertical_line, horizontal_line);

        let text = paper.text(cursor_x, y_cur_sh, "Назови меня").attr({fill: '#888888',"font-size" : 16});

        let number = paper.text(cursor_x - sizeCircle*0.8, y_cur_sh + sizeCircle*1, this.unum).attr({fill: '#fff',"font-size" : 10});

        if (parent !== null) {
            //let icon_move = paper.image('images/icon_move.svg',cursor_x - half_sim, y_cur_sh + sizeCircle - half_sim,size_icon_move,size_icon_move);
            let icon_move = paper.rect(cursor_x - half_sim, y_cur_sh + sizeCircle - 6,size_icon_move,12, 5).attr({'fill': '#fff','stroke': '#000000', "stroke-width": 1.2});
            base.push(icon_move);
        }
        

        let count_el = 0;
        /**все элементы единичного элемента кроме иконки движения */
        let moving_set = paper.set();
        moving_set.push(circEl); count_el++;
        moving_set.push(rectEl); count_el++;
        moving_set.push(text); count_el++;
        moving_set.push(set_ic_add); count_el++;
        moving_set.push(number); count_el++;
        let bbox = moving_set.getBBox();

        
        base.draggable(pointEl,this);
        base.push(moving_set);
        mySet.push(base);
        
        if (parent === null){
            //меняем цвет атрибутов
            change_color(this,moving_set,'red');
        }

        //ВСТРАИВАНИЕ СОБЫТИЙ

        let copyThis = this;
        
        /**При нажатии на верхний треугольник должен всплывать список из иконок */
        rectEl.click(function()
        {
            //если закрыто -- открыть
            if (!redactor.isOpen) {
                redactor.isOpen = true;
                redactor.open(copyThis, base, moving_set, cursor_x + sizeCircle + 1, y_cur_sh_sc, pointEl, bbox, count_el);
            } else { //если открыто, закрыть + если было открыто у другого! - открыть
                const str_Unum = redactor.str_uniqNum;
                //закрываем старый редактор
                redactor.close();
                //если редактор открыт, но не у данного элемента
                if (str_Unum !== copyThis.unum){
                    //открыть его у данного
                    redactor.open(copyThis, base, moving_set, cursor_x + sizeCircle + 1, y_cur_sh_sc, pointEl, bbox, count_el);
                    redactor.isOpen = true;
                }
            }
        });

        /**При нажатии на иконку добавления элемента, создаём линию, которая будет следовать за указателем мыши,
         * пока мы не отпустим его, после чего:
         * создаётся на месте отпуска новый образ
         * ему присваивается определённое уникальное имя
         * следим за движением нового образа, двигая при надобности линию
         */
        set_ic_add.click(function(event)
        {
            let koef_y = 1, koef_x = -1;
            if (event.clientY - 200 < 0) koef_y = -1;
            if (event.clientX + 500 > art.offsetWidth) koef_x = -6.5;

            let el = new Form(event.clientX + 50*koef_x, event.clientY - 100*koef_y, copyThis);
            //для новых линий сдвиг нужен
            let copy_point = new point.default(copyThis.my_point.x + pointEl.x, copyThis.my_point.y + pointEl.y);

            copyThis.array_with_my_lines[copyThis.count_sons] = new Line(copy_point,copyThis.unum,el.my_point,el.unum);
            el.array_with_my_lines[0] = copyThis.array_with_my_lines[copyThis.count_sons];
            myfill.toBack();
            return el;
        });
    }
};

//ОБЩИЕ ДЕЙСТВИЯ (ПРЕДНАСТРОЙКА)
//создать объект класса редактор
let redactor = new Redactor();

let el = new Form();

//скрытие редактора при клике мимо образов
myfill.click(function(){
    redactor.close();
});

//Работа с имеющимся html:
const std_butt = document.getElementById('standart_butt');
std_butt.pressed = false;
std_butt.onclick = function(event){
    if (!std_butt.pressed){
        std_butt.className = 'clicked_bold';
        std_butt.pressed = true;
    }else{
        std_butt.className = 'button_bold';
        std_butt.pressed = false;
    }
};

const butt_save = document.getElementById('save');
butt_save.onclick = function(event){
    if (redactor.isOpen) redactor.close();
    var svgData = paper.toSVG();
    var svgBlob = new Blob([svgData], {type:"image/svg+xml;charset=utf-8"});
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = "newesttree.svg";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}

/**
 * Изменение цвета образа
 * @param {*} form образ
 * @param {*} moving_set набор движимых элементов
 * @param {*} attribute желаемый цвет
 */
function change_color(form,moving_set,attribute){
    //окружность образа
    moving_set[0].attr({"stroke": attribute});
    //уголок
    moving_set[1].attr({"fill": attribute, "stroke": attribute});
    //окружность иконки добавления нового образа
    moving_set[3][0].attr({"stroke": attribute});
    //редактор
    if (moving_set[5]) moving_set[5].attr({"stroke": attribute});

    //форма должна запомнить, что изменила цвет
    form.my_color = attribute;
}

function replacer(txt){
    if (txt !== undefined){
        let re = /.+(?=\\)\\/g;
        return txt.replace(re,'');
    }
}

//описать событие при нажатии на кружок
//появится панель быстрого доступа с иконками
//описать событие при нажатии на иконку 1,2,3,4,5
//дать возможность изменять размер кружка --- сложное или невозможное?
});

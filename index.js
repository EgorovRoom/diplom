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
const w = 0;
/**желаемый размер поля*/
const widthSizePaper = document.body.offsetWidth - w + 16;
const heightSizePaper = ((screen.height - h) / 1) - h - topSizeMenuBrowser;
/**холст */
let paper = Raphael(w, h, widthSizePaper, heightSizePaper);
/**границы поля */
const myfill = paper.rect(0, 0, widthSizePaper, heightSizePaper).attr('fill', '#666').attr('stroke', '#101010');
/**набор объектов*/
const mySet = paper.set();
/**текущая точка*/
let pointCur = new point.default(0, 0);
/**опишем, как будут перемещаться объекты
 * lx изменение положения мыши в данный момент времени по х
 * ly изменение положения мыши в данный момент времени по х
 * ox положение элемента по х
 * oy положение мыши в момент захвата по y
 */
Raphael.st.draggable = function(point) {
    let me = this,
        lx = 0,
        ly = 0,
        ox = 0,
        oy = 0,
        moveFnc = function(dx, dy) {
            lx = dx + ox;  // изменяем значение трансформации по x
            ly = dy + oy;  // делаем тоже самое для y
            me.transform('t' + lx + ',' + ly);
        },
        startFnc = function() {},
        endFnc = function() {
            ox = lx;
            oy = ly;
            pointCur.x = ox;
            pointCur.y = oy;
            point.x = pointCur.x;
            point.y = pointCur.y;
        };
    this.drag(moveFnc, startFnc, endFnc); 
}

document.body.ondblclick = function(event){
    /**текущая точка*/
    let pointEl = new point.default(0, 0);

    let cursor_x = event.clientX;
    let cursor_y = event.clientY;
    /**сдвиг */
    const shift_y = -50;
    let sizeCircle = 50;
    let size_icon_move = 26;
    let half_sim = size_icon_move / 2;
    /**треугольник для открытия меню будет чекбоксом */
    let checked_menu = false;

    //let c = paper.ellipse(cursor_x, y_cur_sh, 50, 50);
    /**координата у, полученная путём сложения текущего места курсора и сдвига */
    let y_cur_sh = cursor_y + shift_y;
    /**координата у, полученная путём сложения текущего места курсора и сдвига за вычетом размера круга */
    let y_cur_sh_sc = y_cur_sh - sizeCircle;
    /*в Рафаэль библиотеки нет родителей и сыновей,
    поэтому нужно делать группы элементов, содержащих в себе в нулевых позициях текст и элемент
    */
    let base = paper.set();
    let rectEl = paper.rect(cursor_x, y_cur_sh_sc,sizeCircle,sizeCircle).attr({'fill': '#000000', 'stroke': '#000000', "stroke-width": 1});
    let circEl = paper.circle(cursor_x, y_cur_sh , sizeCircle).attr({'fill': '#ffffff', 'stroke': '#000000', "stroke-width": 1});
    let icon_move = paper.image('images/icon_move.svg',cursor_x - half_sim, y_cur_sh + sizeCircle - half_sim,size_icon_move,size_icon_move);
    const text = paper.text(cursor_x, y_cur_sh, "rename me").attr({fill: '#888888',"font-size" : 16});
    /**все элементы единичного элемента кроме иконки движения */
    let elems_without_mv = paper.set();
    elems_without_mv.push(circEl);
    elems_without_mv.push(rectEl);
    elems_without_mv.push(text);
    let bbox = elems_without_mv.getBBox();
    /**При нажатии на верхний треугольник должен всплывать список из иконок */
    rectEl.click(function() {
        //если закрыто -- открыть, если открыто, закрыть
        checked_menu = !checked_menu
            ?
            add_all_icons_in_set(base,cursor_x + sizeCircle + 1, y_cur_sh_sc, pointEl, elems_without_mv, bbox)
            :
            del_icon_menu(elems_without_mv, 3); //3 -- положение icons_menu в наборе
    });

    base.push(icon_move);
    base.draggable(pointEl);
    base.push(elems_without_mv);
    mySet.push(base);
};

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
 * @param {*} set набор с окружностью и уголком
 */
function add_icons_in_set(x, y, wIcon, hIcon, src, index, set_for_pushing, pC, base_set, inside_set, bbox){
    /**текущая точка*/
    let point_с = new point.default(pC.x, pC.y);
    /**иконка для открытия меню будет чекбоксом */
    let checked_icon_menu = false;
    /**набор для цветов */
    let set = paper.set();

    /**набор с элементами иконки */
    let icon = paper.set();
    /**Подложка */
    let fill = paper.rect(x,y,wIcon,hIcon).attr({"fill": '#fff', 'stroke': '#000000', "stroke-width": 1});
    /**картинка */
    let image = paper.image(src,x,y,wIcon,hIcon);

    icon.push(fill);
    icon.push(image);

    //При клике на картинку делать:
    image.click( function() {
        let del_element;
        let parent_div1 = document.getElementById('for_adding_input').innerHTML;
        let parent_div2 = document.getElementById('for_adding_input2').innerHTML;
        //если закрыто -- открыть, если открыто, закрыть
        if (!checked_icon_menu || (index === 1 && parent_div2 === '') || (index === 0 && parent_div1 === '')){
            if ((index === 1 && parent_div2 !== '')
            || (index === 0 && parent_div1 !== '')){
                checked_icon_menu = del_menu_after_click_on_icon(set,del_element,index);
            }else{
                //вызвать функцию события при клике на иконку
                del_element = event_click_on_icon(x, y, wIcon, hIcon, index, base_set, inside_set, bbox);
                if (index === 2){
                    set = del_element.translate(pC.x, pC.y);
                    icon.push(set);
                    checked_icon_menu = true;
                }
            }
        }else{
            checked_icon_menu = del_menu_after_click_on_icon(set,del_element,index);
        }
    });

    set_for_pushing.push(icon);
}
/**
 * Добавление всех наборов иконок в главный набор обозначающий основной элемент
 * @param {RaphaelSet} base_set набор содержащий все части основного элемента
 * @param {number} x координата х для левого края иконки
 * @param {number} y координата у для левого края иконки
 * @param {point.default} pC разница в координатах между созданием объекта и текущим его положением
 * @param {*} base_set набор образом
 * @param {*} set набор с окружностью и уголком
 */
function add_all_icons_in_set(base_set, x, y, pC, set, bbox){
    let all_icons = paper.set();
    /**Ширина иконка */
    const wIcon = 30;//39;
    /**Высота иконка */
    const hIcon = 23;//30;
    /**Ссылка на картинку-иконку */
    const srcs = [
        'images/redactor_text.svg', /**иконка редактора текста */
        'images/redactor_input_img.svg', /**иконка вставки картинки */
        'images/redactor_color.svg', /**иконка изменения цвета */
        'images/redactor_del.svg' /**иконка удаления */
    ];
    //добавить иконки
    for (let i = 0; i < srcs.length; i++){
        add_icons_in_set(x, y + i*hIcon, wIcon, hIcon, srcs[i], i, all_icons, pC, base_set, set, bbox);
    };
    //переместить меню к главному объекту, если главный объект был сдвинут с места создания
    all_icons.translate(pC.x, pC.y);
    //вставка набора иконок в основной набор
    set.push(all_icons);
    return true;
}
/**
 * Функция удаления меню из объекта единичного элемента
 * @param {RaphaelSet} base_set набор, содержащий в себе все элементы единичного элемента, кроме иконки движения
 * @param {number} index какой элемент вытащить из набора
 */
function del_icon_menu(base_set, index){
    /**вытащить из набора набор с иконками */
    let item = base_set.items.splice(index,1);
    //для каждой иконки
    item.forEach(
        function(icons_of_item){
            //Не удалять комментарий в //
            //для каждого элемента иконки
            //icons_of_item.forEach(
            //   function(el){
                    //Не удалять комментарий в //
                    //Чистит подложку + картинку + (если есть) весь набор
                    //for (let i = 0; el[i]; i++){
                    //  el[i].remove();
                    //}
            //      el.remove();
            //   }
            //)
            icons_of_item.remove();
        }
    );
    return false;
}
/**
 * Тело события при нажатии на иконку из меню
 * @param {number} x координата х для левого края иконки
 * @param {number} y координата у для левого края иконки
 * @param {number} wIcon размер иконки по ширине
 * @param {number} hIcon размер иконки по высоте
 * @param {number} index номер иконки
 * @param {*} base_set набор с образом
 * @param {*} set набор с окружностью и уголком
 */
function event_click_on_icon(x, y, wIcon, hIcon, index, base_set, set, bbox) {
    //Make case
    if (index === 0){
        const posx = widthSizePaper - bbox.width / 2 - bbox.x;
        const posy = heightSizePaper - bbox.height / 2 - bbox.y;

        let d = document.createElement('div');
        d.innerHTML = 'Ваш текст: ';
        d.className='inl-blk';
	    document.getElementById('for_adding_input').appendChild(d);

        const button = document.createElement('button');
        button.className='button_agree';
        const button_bold = document.createElement('button');
        button_bold.innerHTML = "B";
        button_bold.className = 'button_bold';
        let newInput = document.createElement('input');
        let slct = document.createElement('select');
        slct.className = 'slct_style';
        
        let opt1 = document.createElement('option'); slct.appendChild(opt1);
        let opt2 = document.createElement('option'); slct.appendChild(opt2);
        let opt3 = document.createElement('option'); slct.appendChild(opt3);
        let opt4 = document.createElement('option'); slct.appendChild(opt4);
        let opt5 = document.createElement('option'); slct.appendChild(opt5);

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

        let bold = false;
        button_bold.onclick = function(){
            if (!bold){
                bold = true;
                button_bold.className='clicked_bold';
            }else{
                bold = false;
                button_bold.className='button_bold';
            }
        };
        button.onclick = function(){
            //выдираем текст из набора всех элементов образа кроме перемещения
            let txt = set.items.splice(0,4);
            //функция изучения текста и разбиения его на строчки, возвращает массив, его длина будет говорить о сдвиге наверх
            const new_text = check_text(newInput.value);
            //С помощью данной строчки можно изменять текст внутри
            txt[2].attr({text: new_text, fill: '#000', 'font-size': slct.value});
            if (bold) {
                txt[2].attr({'font-weight': 'bold'});
            } else {
                txt[2].attr({'font-weight': 'normal'});
            }
            //возвращаем выдернутые элементы
            set.push(txt[0],txt[1],txt[2],txt[3]);
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
        input.setAttribute('onchange',
        'let tv = this.value; tv = tv.replace(/.+(?=\\)\\/g,\'\'); document.getElementById(\'div2_id\').innerHTML = tv;'
        );

        div1.innerHTML = 'Выбрать';
        div2.innerHTML = 'Выберете файл';
        div2.id = 'div2_id';

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
        const colors = ['#c33','#11bb66','#00f','#cc33aa','#bbbb66','#4bf','#000'];
        y -= 2*hIcon;
        x += wIcon + 5;
        hIcon /= 1.5;
        wIcon /= 2;
        for (let i = 0; i < colors.length; i++){
            //находясь на иконке цвета мы имеем "y" такой,
            //что он находится на уровне этой иконки,а мы хотим цвета расположить сверху вниз от начала
            let fill = create_fill_for_icon_color(x,y + i*hIcon,wIcon,hIcon,colors[i],i,set);
            icon_set.push(fill);
        }
        return icon_set;
    }
    if (index === 3){
        base_set.forEach(
            function(el){
                el.remove();
            }
        );
        //отчистка div элемента от вероятного окна ввода
        let div_elem1 = document.getElementById('for_adding_input');
        if (div_elem) div_elem.innerHTML = "";
        let div_elem2 = document.getElementById('for_adding_input2');
        if (div_elem2) div_elem2.innerHTML = "";
        return false;
    }
}
/**
 * Создание цветового квадратика
 * @param {number} x координата х для левого края иконки
 * @param {number} y координата у для левого края иконки
 * @param {number} wIcon размер иконки по ширине
 * @param {number} hIcon размер иконки по высоте
 * @param {string} attribute выбранный цвет
 * @param {number} index номер иконки цвета
 * @param {*} set набор с окружностью и уголком
 */
function create_fill_for_icon_color(x,y,wIcon,hIcon,attribute,index,set){
    let fill = paper.rect(x,y,wIcon,hIcon).attr({"fill": attribute, 'stroke': '#000', "stroke-width": 1});
    //требуется изменить при клике -- аттрибут цвета окружности и треугольника

    fill.click( function() {
        /**вытащить из набора круг и уголок */
        let el = set.items.splice(0,4);
        el[0].attr({"stroke": attribute});
        el[1].attr({"fill": attribute, "stroke": attribute});
        set.push(el[0],el[1],el[2],el[3]);
    });

    return fill;
}

function del_menu_after_click_on_icon(set,del_element,index){
    if (index === 0){
        document.getElementById('for_adding_input').innerHTML = "";
    }
    if (index === 1){
        document.getElementById('for_adding_input2').innerHTML = "";
    }
    if (index === 2){
        set.forEach(function(color){
            color.remove();
        });
    }
    return false;
}

//подготовка текста для образа
function check_text(text){
    let re = new RegExp('\  ','g');
    text = text.replace(re,'\n');
    return text;
}

//описать событие при нажатии на кружок
//появится панель быстрого доступа с иконками
//описать событие при нажатии на иконку 1,2,3,4,5
//дать возможность изменять размер кружка --- сложное или невозможное?
});
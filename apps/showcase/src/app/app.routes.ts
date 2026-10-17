import { Routes } from '@angular/router';
import { IntroductionComponent } from './pages/introduction.component';
import { ColorsComponent } from './pages/colors.component';
import { ThemingComponent } from './pages/theming.component';
import { IconsComponent } from './pages/icons.component';
import { ButtonDocComponent } from './pages/button-doc.component';
import { InputDocComponent } from './pages/input-doc.component';
import { SelectDocComponent } from './pages/select-doc.component';
import { TextareaDocComponent } from './pages/textarea-doc.component';
import { CheckboxDocComponent } from './pages/checkbox-doc.component';
import { RadioDocComponent } from './pages/radio-doc.component';
import { ToggleDocComponent } from './pages/toggle-doc.component';
import { InputNumberDocComponent } from './pages/input-number-doc.component';
import { AutocompleteDocComponent } from './pages/autocomplete-doc.component';
import { DatepickerDocComponent } from './pages/datepicker-doc.component';
import { DialogDocComponent } from './pages/dialog-doc.component';
import { ToastDocComponent } from './pages/toast-doc.component';
import { InputgroupDocComponent } from './pages/inputgroup-doc.component';
import { RatingDocComponent } from './pages/rating-doc.component';
import { SliderDocComponent } from './pages/slider-doc.component';
import { ChipsDocComponent } from './pages/chips-doc.component';
import { MultiselectDocComponent } from './pages/multiselect-doc.component';
import { ColorpickerDocComponent } from './pages/colorpicker-doc.component';
import { BadgeDocComponent } from './pages/badge-doc.component';
import { TagDocComponent } from './pages/tag-doc.component';
import { MessageDocComponent } from './pages/message-doc.component';
import { CardDocComponent } from './pages/card-doc.component';
import { DividerDocComponent } from './pages/divider-doc.component';
import { TooltipDocComponent } from './pages/tooltip-doc.component';
import { PopoverDocComponent } from './pages/popover-doc.component';
import { DrawerDocComponent } from './pages/drawer-doc.component';

export const routes: Routes = [
  { path: '', redirectTo: 'introduction', pathMatch: 'full' },
  { path: 'introduction', component: IntroductionComponent, title: 'CaribeNG' },
  { path: 'foundations/colors', component: ColorsComponent, title: 'Colors · CaribeNG' },
  { path: 'foundations/theming', component: ThemingComponent, title: 'Theming · CaribeNG' },
  { path: 'foundations/icons', component: IconsComponent, title: 'Icons · CaribeNG' },
  { path: 'components/button', component: ButtonDocComponent, title: 'Button · CaribeNG' },
  { path: 'components/input', component: InputDocComponent, title: 'Input · CaribeNG' },
  { path: 'components/select', component: SelectDocComponent, title: 'Select · CaribeNG' },
  { path: 'components/textarea', component: TextareaDocComponent, title: 'Textarea · CaribeNG' },
  { path: 'components/checkbox', component: CheckboxDocComponent, title: 'Checkbox · CaribeNG' },
  { path: 'components/radio', component: RadioDocComponent, title: 'Radio · CaribeNG' },
  { path: 'components/toggle', component: ToggleDocComponent, title: 'Toggle · CaribeNG' },
  { path: 'components/input-number', component: InputNumberDocComponent, title: 'InputNumber · CaribeNG' },
  { path: 'components/autocomplete', component: AutocompleteDocComponent, title: 'Autocomplete · CaribeNG' },
  { path: 'components/datepicker', component: DatepickerDocComponent, title: 'DatePicker · CaribeNG' },
  { path: 'components/inputgroup', component: InputgroupDocComponent, title: 'InputGroup · CaribeNG' },
  { path: 'components/rating', component: RatingDocComponent, title: 'Rating · CaribeNG' },
  { path: 'components/slider', component: SliderDocComponent, title: 'Slider · CaribeNG' },
  { path: 'components/chips', component: ChipsDocComponent, title: 'Chips · CaribeNG' },
  { path: 'components/multiselect', component: MultiselectDocComponent, title: 'MultiSelect · CaribeNG' },
  { path: 'components/colorpicker', component: ColorpickerDocComponent, title: 'ColorPicker · CaribeNG' },
  { path: 'components/dialog', component: DialogDocComponent, title: 'Dialog · CaribeNG' },
  { path: 'components/drawer', component: DrawerDocComponent, title: 'Drawer · CaribeNG' },
  { path: 'components/tooltip', component: TooltipDocComponent, title: 'Tooltip · CaribeNG' },
  { path: 'components/popover', component: PopoverDocComponent, title: 'Popover · CaribeNG' },
  { path: 'components/toast', component: ToastDocComponent, title: 'Toast · CaribeNG' },
  { path: 'components/badge', component: BadgeDocComponent, title: 'Badge · CaribeNG' },
  { path: 'components/tag', component: TagDocComponent, title: 'Tag · CaribeNG' },
  { path: 'components/message', component: MessageDocComponent, title: 'Message · CaribeNG' },
  { path: 'components/card', component: CardDocComponent, title: 'Card · CaribeNG' },
  { path: 'components/divider', component: DividerDocComponent, title: 'Divider · CaribeNG' },
  { path: '**', redirectTo: 'introduction' },
];

import { Routes } from '@angular/router';
import { IntroductionComponent } from './pages/introduction.component';
import { ColorsComponent } from './pages/colors.component';
import { ThemingComponent } from './pages/theming.component';
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

export const routes: Routes = [
  { path: '', redirectTo: 'introduction', pathMatch: 'full' },
  { path: 'introduction', component: IntroductionComponent, title: 'CaribeNG' },
  { path: 'foundations/colors', component: ColorsComponent, title: 'Colors · CaribeNG' },
  { path: 'foundations/theming', component: ThemingComponent, title: 'Theming · CaribeNG' },
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
  { path: 'components/dialog', component: DialogDocComponent, title: 'Dialog · CaribeNG' },
  { path: 'components/toast', component: ToastDocComponent, title: 'Toast · CaribeNG' },
  { path: '**', redirectTo: 'introduction' },
];

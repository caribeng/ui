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
import { AccordionDocComponent } from './pages/accordion-doc.component';
import { TabsDocComponent } from './pages/tabs-doc.component';
import { StepperDocComponent } from './pages/stepper-doc.component';
import { AvatarDocComponent } from './pages/avatar-doc.component';
import { ProgressbarDocComponent } from './pages/progressbar-doc.component';
import { SpinnerDocComponent } from './pages/spinner-doc.component';
import { SkeletonDocComponent } from './pages/skeleton-doc.component';
import { BreadcrumbDocComponent } from './pages/breadcrumb-doc.component';
import { SelectbuttonDocComponent } from './pages/selectbutton-doc.component';
import { TogglebuttonDocComponent } from './pages/togglebutton-doc.component';
import { ListboxDocComponent } from './pages/listbox-doc.component';
import { KnobDocComponent } from './pages/knob-doc.component';
import { TableDocComponent } from './pages/table-doc.component';
import { PaginatorDocComponent } from './pages/paginator-doc.component';
import { MenuDocComponent } from './pages/menu-doc.component';
import { MenubarDocComponent } from './pages/menubar-doc.component';
import { TabmenuDocComponent } from './pages/tabmenu-doc.component';
import { ContextmenuDocComponent } from './pages/contextmenu-doc.component';
import { PanelmenuDocComponent } from './pages/panelmenu-doc.component';
import { TieredmenuDocComponent } from './pages/tieredmenu-doc.component';
import { MegamenuDocComponent } from './pages/megamenu-doc.component';
import { DockDocComponent } from './pages/dock-doc.component';
import { StepsDocComponent } from './pages/steps-doc.component';
import { PanelDocComponent } from './pages/panel-doc.component';
import { FieldsetDocComponent } from './pages/fieldset-doc.component';
import { ToolbarDocComponent } from './pages/toolbar-doc.component';
import { SplitterDocComponent } from './pages/splitter-doc.component';
import { ScrollpanelDocComponent } from './pages/scrollpanel-doc.component';
import { ScrolltopDocComponent } from './pages/scrolltop-doc.component';
import { DataviewDocComponent } from './pages/dataview-doc.component';
import { TreeDocComponent } from './pages/tree-doc.component';
import { TreetableDocComponent } from './pages/treetable-doc.component';
import { TimelineDocComponent } from './pages/timeline-doc.component';
import { VirtualscrollerDocComponent } from './pages/virtualscroller-doc.component';
import { OrderlistDocComponent } from './pages/orderlist-doc.component';
import { PicklistDocComponent } from './pages/picklist-doc.component';
import { ConfirmdialogDocComponent } from './pages/confirmdialog-doc.component';
import { ConfirmpopupDocComponent } from './pages/confirmpopup-doc.component';
import { DynamicdialogDocComponent } from './pages/dynamicdialog-doc.component';
import { InputmaskDocComponent } from './pages/inputmask-doc.component';
import { InputotpDocComponent } from './pages/inputotp-doc.component';
import { FloatlabelDocComponent } from './pages/floatlabel-doc.component';
import { IconfieldDocComponent } from './pages/iconfield-doc.component';
import { TreeselectDocComponent } from './pages/treeselect-doc.component';
import { CascadeselectDocComponent } from './pages/cascadeselect-doc.component';
import { FileuploadDocComponent } from './pages/fileupload-doc.component';
import { EditorDocComponent } from './pages/editor-doc.component';
import { CarouselDocComponent } from './pages/carousel-doc.component';
import { ImageDocComponent } from './pages/image-doc.component';
import { GalleriaDocComponent } from './pages/galleria-doc.component';
import { AvatargroupDocComponent } from './pages/avatargroup-doc.component';
import { ChipDocComponent } from './pages/chip-doc.component';
import { MetergroupDocComponent } from './pages/metergroup-doc.component';
import { InplaceDocComponent } from './pages/inplace-doc.component';
import { BlockuiDocComponent } from './pages/blockui-doc.component';
import { InlinemessageDocComponent } from './pages/inlinemessage-doc.component';
import { TerminalDocComponent } from './pages/terminal-doc.component';
import { RippleDocComponent } from './pages/ripple-doc.component';

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
  { path: 'components/selectbutton', component: SelectbuttonDocComponent, title: 'SelectButton · CaribeNG' },
  { path: 'components/togglebutton', component: TogglebuttonDocComponent, title: 'ToggleButton · CaribeNG' },
  { path: 'components/listbox', component: ListboxDocComponent, title: 'ListBox · CaribeNG' },
  { path: 'components/knob', component: KnobDocComponent, title: 'Knob · CaribeNG' },
  { path: 'components/inputmask', component: InputmaskDocComponent, title: 'InputMask · CaribeNG' },
  { path: 'components/inputotp', component: InputotpDocComponent, title: 'InputOTP · CaribeNG' },
  { path: 'components/floatlabel', component: FloatlabelDocComponent, title: 'FloatLabel · CaribeNG' },
  { path: 'components/iconfield', component: IconfieldDocComponent, title: 'IconField · CaribeNG' },
  { path: 'components/treeselect', component: TreeselectDocComponent, title: 'TreeSelect · CaribeNG' },
  { path: 'components/cascadeselect', component: CascadeselectDocComponent, title: 'CascadeSelect · CaribeNG' },
  { path: 'components/fileupload', component: FileuploadDocComponent, title: 'FileUpload · CaribeNG' },
  { path: 'components/editor', component: EditorDocComponent, title: 'Editor · CaribeNG' },
  { path: 'components/table', component: TableDocComponent, title: 'Table · CaribeNG' },
  { path: 'components/paginator', component: PaginatorDocComponent, title: 'Paginator · CaribeNG' },
  { path: 'components/menu', component: MenuDocComponent, title: 'Menu · CaribeNG' },
  { path: 'components/menubar', component: MenubarDocComponent, title: 'Menubar · CaribeNG' },
  { path: 'components/tabmenu', component: TabmenuDocComponent, title: 'TabMenu · CaribeNG' },
  { path: 'components/contextmenu', component: ContextmenuDocComponent, title: 'ContextMenu · CaribeNG' },
  { path: 'components/panelmenu', component: PanelmenuDocComponent, title: 'PanelMenu · CaribeNG' },
  { path: 'components/tieredmenu', component: TieredmenuDocComponent, title: 'TieredMenu · CaribeNG' },
  { path: 'components/megamenu', component: MegamenuDocComponent, title: 'MegaMenu · CaribeNG' },
  { path: 'components/dock', component: DockDocComponent, title: 'Dock · CaribeNG' },
  { path: 'components/steps', component: StepsDocComponent, title: 'Steps · CaribeNG' },
  { path: 'components/dialog', component: DialogDocComponent, title: 'Dialog · CaribeNG' },
  { path: 'components/drawer', component: DrawerDocComponent, title: 'Drawer · CaribeNG' },
  { path: 'components/tooltip', component: TooltipDocComponent, title: 'Tooltip · CaribeNG' },
  { path: 'components/popover', component: PopoverDocComponent, title: 'Popover · CaribeNG' },
  { path: 'components/toast', component: ToastDocComponent, title: 'Toast · CaribeNG' },
  { path: 'components/badge', component: BadgeDocComponent, title: 'Badge · CaribeNG' },
  { path: 'components/tag', component: TagDocComponent, title: 'Tag · CaribeNG' },
  { path: 'components/message', component: MessageDocComponent, title: 'Message · CaribeNG' },
  { path: 'components/inlinemessage', component: InlinemessageDocComponent, title: 'InlineMessage · CaribeNG' },
  { path: 'components/card', component: CardDocComponent, title: 'Card · CaribeNG' },
  { path: 'components/panel', component: PanelDocComponent, title: 'Panel · CaribeNG' },
  { path: 'components/fieldset', component: FieldsetDocComponent, title: 'Fieldset · CaribeNG' },
  { path: 'components/toolbar', component: ToolbarDocComponent, title: 'Toolbar · CaribeNG' },
  { path: 'components/splitter', component: SplitterDocComponent, title: 'Splitter · CaribeNG' },
  { path: 'components/scrollpanel', component: ScrollpanelDocComponent, title: 'ScrollPanel · CaribeNG' },
  { path: 'components/scrolltop', component: ScrolltopDocComponent, title: 'ScrollTop · CaribeNG' },
  { path: 'components/divider', component: DividerDocComponent, title: 'Divider · CaribeNG' },
  { path: 'components/accordion', component: AccordionDocComponent, title: 'Accordion · CaribeNG' },
  { path: 'components/tabs', component: TabsDocComponent, title: 'Tabs · CaribeNG' },
  { path: 'components/stepper', component: StepperDocComponent, title: 'Stepper · CaribeNG' },
  { path: 'components/avatar', component: AvatarDocComponent, title: 'Avatar · CaribeNG' },
  { path: 'components/avatargroup', component: AvatargroupDocComponent, title: 'AvatarGroup · CaribeNG' },
  { path: 'components/carousel', component: CarouselDocComponent, title: 'Carousel · CaribeNG' },
  { path: 'components/image', component: ImageDocComponent, title: 'Image · CaribeNG' },
  { path: 'components/galleria', component: GalleriaDocComponent, title: 'Galleria · CaribeNG' },
  { path: 'components/progressbar', component: ProgressbarDocComponent, title: 'ProgressBar · CaribeNG' },
  { path: 'components/spinner', component: SpinnerDocComponent, title: 'Spinner · CaribeNG' },
  { path: 'components/skeleton', component: SkeletonDocComponent, title: 'Skeleton · CaribeNG' },
  { path: 'components/chip', component: ChipDocComponent, title: 'Chip · CaribeNG' },
  { path: 'components/metergroup', component: MetergroupDocComponent, title: 'MeterGroup · CaribeNG' },
  { path: 'components/inplace', component: InplaceDocComponent, title: 'Inplace · CaribeNG' },
  { path: 'components/blockui', component: BlockuiDocComponent, title: 'BlockUI · CaribeNG' },
  { path: 'components/terminal', component: TerminalDocComponent, title: 'Terminal · CaribeNG' },
  { path: 'components/ripple', component: RippleDocComponent, title: 'Ripple · CaribeNG' },
  { path: 'components/breadcrumb', component: BreadcrumbDocComponent, title: 'Breadcrumb · CaribeNG' },
  { path: 'components/dataview', component: DataviewDocComponent, title: 'DataView · CaribeNG' },
  { path: 'components/tree', component: TreeDocComponent, title: 'Tree · CaribeNG' },
  { path: 'components/treetable', component: TreetableDocComponent, title: 'TreeTable · CaribeNG' },
  { path: 'components/timeline', component: TimelineDocComponent, title: 'Timeline · CaribeNG' },
  { path: 'components/virtualscroller', component: VirtualscrollerDocComponent, title: 'VirtualScroller · CaribeNG' },
  { path: 'components/orderlist', component: OrderlistDocComponent, title: 'OrderList · CaribeNG' },
  { path: 'components/picklist', component: PicklistDocComponent, title: 'PickList · CaribeNG' },
  { path: 'components/confirmdialog', component: ConfirmdialogDocComponent, title: 'ConfirmDialog · CaribeNG' },
  { path: 'components/confirmpopup', component: ConfirmpopupDocComponent, title: 'ConfirmPopup · CaribeNG' },
  { path: 'components/dynamicdialog', component: DynamicdialogDocComponent, title: 'DynamicDialog · CaribeNG' },
  { path: '**', redirectTo: 'introduction' },
];

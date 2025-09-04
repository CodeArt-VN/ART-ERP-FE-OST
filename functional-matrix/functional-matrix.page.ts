import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, OST_FunctionalMatrixProvider, OST_ValueChainProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { FunctionalMatrixDetailPage } from '../functional-matrix-detail/functional-matrix-detail.page';

@Component({
	selector: 'app-functional-matrix',
	templateUrl: 'functional-matrix.page.html',
	styleUrls: ['functional-matrix.page.scss'],
	standalone: false,
})
export class FunctionalMatrixPage extends PageBase {
	supportActivities = [];
	primaryActivities = [];
	valueChainList = [];
	branchList = [];
	isAllRowOpened = true;
	constructor(
		public pageProvider: OST_FunctionalMatrixProvider,
		public branchProvider: BRA_BranchProvider,
		public valueChainProvider: OST_ValueChainProvider,
		public modalController: ModalController,
		public popoverCtrl: PopoverController,
		public alertCtrl: AlertController,
		public loadingController: LoadingController,
		public env: EnvService,
		public navCtrl: NavController,
		public location: Location
	) {
		super();
		this.pageConfig.ShowAdd = false;
		this.pageConfig.ShowAddNew = true;
	}

	preLoadData(event?: any): void {
		Promise.all([this.valueChainProvider.read()]).then((values: any) => {
			this.valueChainList = values[0].data;
			this.branchList = this.env.branchList.filter((d) => d.IDParent == 16);

			this.valueChainList
				.filter((d) => !d.IDParent)
				.forEach((i) => {
					if (i.Type === 'Primary') this.primaryActivities.push(i);
					else this.supportActivities.push(i);
					this.valueChainList
						.filter((d) => d.IDParent == i.Id)
						.forEach((c) => {
							if (!i.Sections) i.Sections = [];
							i.Sections.push(c);
						});
				});
			super.preLoadData(event);
		});
	}
	
	loadedData(event) {
		super.loadedData(event);
	}
	getRowSpan(list) {
		return list.reduce((sum, a) => sum + (a.Sections?.length ? a.Sections.length : 1), 0);
	}

	async showModal(desc, branch) {
		let datas = this.items.filter((d) => d.IDBranch == branch?.Id && d.IDValueChain == desc?.Id);
		const modal = await this.modalController.create({
			component: FunctionalMatrixDetailPage,
			componentProps: {
				items: datas,
				valueChain: desc,
				branch: branch,
			},
			cssClass: 'my-custom-class',
		});
		await modal.present();
		const { data } = await modal.onWillDismiss();
		if (data) this.refresh();
	}

	getColor(index) {
		const baseHue = 210; // màu xanh dương lam
		const step = 10; // khoảng cách tăng màu
		const lightness = 80 - index * 10; // độ sáng giảm dần
		return `hsl(${baseHue}, 70%, ${lightness}%)`;
	}
	getColorDescription(index) {
		const maxIndex = 5; // Số mức tối đa bạn muốn phân biệt
		const step = 10; // Mỗi bước giảm 10% độ sáng
		const lightness = 95 - Math.min(index, maxIndex) * step; // Giới hạn không quá tối
		return `hsl(0, 0%, ${lightness}%)`; // hue=0, saturati
	}
	isOpenAddNewPopover = false;
	@ViewChild('addNewPopover') addNewPopover!: HTMLIonPopoverElement;
	presentAddNewPopover(e) {
		this.addNewPopover.event = e;
		this.isOpenAddNewPopover = !this.isOpenAddNewPopover;
	}
}

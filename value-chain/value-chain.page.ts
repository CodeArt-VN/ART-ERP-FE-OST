import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, OST_ValueChainProvider, SYS_ActionProvider, SYS_IntegrationProviderProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { SortConfig } from 'src/app/models/options-interface';
import { ValueChainDetailPage } from '../value-chain-detail/value-chain-detail.page';

@Component({
	selector: 'app-value-chain',
	templateUrl: 'value-chain.page.html',
	styleUrls: ['value-chain.page.scss'],
	standalone: false,
})
export class ValueChainPage extends PageBase {
	supportActivities =[];
	primaryActivities = [];
	isAllRowOpened = true;
	constructor(
		public pageProvider: OST_ValueChainProvider,
		public providerService: SYS_IntegrationProviderProvider,
		public branchProvider: BRA_BranchProvider,
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
		super.preLoadData(event);
	}
	loadedData(event) {
		super.loadedData(event);
		this.primaryActivities = [];
		this.supportActivities = [];
		this.items
			.filter((d) => !d.IDParent)
			.forEach((i) => {
				if (i.Type === 'Primary') this.primaryActivities.push(i);
				else this.supportActivities.push(i);
				this.items
					.filter((d) => d.IDParent == i.Id)
					.forEach((c) => {
						if(!i.Sections) i.Sections = [];
						i.Sections.push(c);
					});
			});
	}

	add(isblockBelong = false) {
		let newItem = {
			Id: 0,
			IsDisabled: false,
			Type:null
		};
		this.showModal(newItem,null,null,isblockBelong);
	}

	async showModal(i,type=null,IDParent=null,isblockBelong = false) {
		if(i?.Id && !this.pageConfig.canEdit) return;
		if(!i) i ={
			Id: 0,
			IsDisabled: false,
			Type:null
		};
		if(type) i.Type = type;
		if(IDParent)i.IDParent = IDParent;
		const modal = await this.modalController.create({
			component: ValueChainDetailPage,
			componentProps: {
				items: this.items,
				item: i,
				id: i?.Id,
				isBlockBelong:isblockBelong
			},
			cssClass: 'my-custom-class',
		});
		await modal.present();
		const { data } = await modal.onWillDismiss();
		if(data)this.refresh();
		
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

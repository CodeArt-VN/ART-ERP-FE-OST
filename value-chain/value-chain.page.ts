import { Component, ViewChild } from '@angular/core';
import { NavController, ModalController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { EnvService } from 'src/app/services/core/env.service';
import { PageBase } from 'src/app/page-base';
import { BRA_BranchProvider, OST_ValueChainProvider, SYS_ActionProvider, SYS_IntegrationProviderProvider } from 'src/app/services/static/services.service';
import { Location } from '@angular/common';
import { SortConfig } from 'src/app/interfaces/options-interface';
import { ValueChainDetailPage } from '../value-chain-detail/value-chain-detail.page';
import { lib } from 'src/app/services/static/global-functions';

@Component({
	selector: 'app-value-chain',
	templateUrl: 'value-chain.page.html',
	styleUrls: ['value-chain.page.scss'],
	standalone: false,
})
export class ValueChainPage extends PageBase {
	supportActivities = [];
	primaryActivities = [];
	itemsState = [];
	IDPrimaryActivities: string = lib.generateUID();
	IDSupportActivities: string = lib.generateUID();
	isAllRowOpened = true;
	viewTree = true;
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
		this.query.AllParent = true;
		super.preLoadData(event);
	}
	
	loadedData(event) {
		this.itemsState = [];
		// let masterID = lib.generateUID()
		// this.itemsState.push({
		// 	Id: masterID,
		// 	Name: 'All activities',
		// 	show: this.isAllRowOpened,
		// });

		if (!this.itemsState.some(d => d.Id == this.IDPrimaryActivities)) {
			this.itemsState.push({
				Id: this.IDPrimaryActivities,
				Name: 'Primary activities',
				Type: 'Primary',
				show: this.isAllRowOpened,
				Disabled: true
			})

		}
		if (!this.itemsState.some(d => d.Id == this.IDSupportActivities)) {
			this.itemsState.push({
				Id: this.IDSupportActivities,
				Name: 'Support activities',
				Type: 'Support',
				show: this.isAllRowOpened,
				Disabled: true
			})

		}
		this.items.forEach(i => {
			this.itemsState.push(i);
			if (!i.IDParent) {
				if (i.Type == 'Primary') i.IDParent = this.IDPrimaryActivities;
				else if (i.Type == 'Support') i.IDParent = this.IDSupportActivities;
			}

		})
		this.buildFlatTree(this.itemsState, [], this.isAllRowOpened).then((resp: any) => {
			this.itemsState = resp;
		});
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
						if (!i.Sections) i.Sections = [];
						i.Sections.push(c);
					});
			});
	}

	add(isblockBelong = false) {
		let newItem = {
			Id: 0,
			IsDisabled: false,
			Type: null
		};
		this.showModal(newItem, null, null, isblockBelong);
	}

	async showModal(i, type = null, IDParent = null, isblockBelong = false) {
		if (i?.Id && !this.pageConfig.canEdit) return;
		if (!i) i = {
			Id: 0,
			IsDisabled: false,
			Type: null
		};
		if (type) i.Type = type;
		if (IDParent) i.IDParent = IDParent;
		const modal = await this.modalController.create({
			component: ValueChainDetailPage,
			componentProps: {
				items: this.itemsState,
				item: i,
				id: i?.Id,
				isBlockBelong: isblockBelong
			},
			cssClass: 'my-custom-class',
		});
		await modal.present();
		const { data } = await modal.onWillDismiss();
		if (data) this.refresh();

	}
	isOpenAddNewPopover = false;
	@ViewChild('addNewPopover') addNewPopover!: HTMLIonPopoverElement;
	presentAddNewPopover(e) {
		this.addNewPopover.event = e;
		this.isOpenAddNewPopover = !this.isOpenAddNewPopover;
	}

}

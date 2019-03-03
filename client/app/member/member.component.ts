import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UserService, AlertService, Member } from '../_services/index';
import { first } from 'rxjs/operators';
import * as _ from 'lodash';


@Component({
    moduleId: module.id,
    templateUrl: 'member.component.html'
})

export class MemberComponent implements OnInit {

    registerMemberForm: FormGroup;
    submitted = false;
    error = '';
    isModalActive: boolean = false;
    loading = false;
    members: Member[] = [];
    topupModalActive: boolean = false;
    updateModalActive: boolean = false;
  

    constructor(
        private formBuilder: FormBuilder,
        private userService: UserService,
        private alertService: AlertService
    ) { }

    ngOnInit() {
        this.registerMemberForm = this.formBuilder.group({
            'membername': ['', Validators.required],
            'room': ['', Validators.required],
            'tel': ['', Validators.required],
            'email': ['', [Validators.required,Validators.email]],
            'password': ['', [Validators.required,Validators.minLength(6)]],
            'credit': '',
            '_id': ''

        });
        
        this.loadAllMembers();

    }

    get f() { return this.registerMemberForm.controls; }

    onSubmit() {
        this.submitted = true;

        if (this.registerMemberForm.invalid) {
            console.log(this.registerMemberForm.value);
            return;
          }

        this.userService.createMember(this.registerMemberForm.value)
            .pipe(first())
            .subscribe(
                 data => {
                     console.log(data);
                     this.toggleModal();
                     this.loadAllMembers();
                     this.alertService.success('Create Member Successul',true);
                    },
                    error => {
                        this.alertService.error(error);
                        this.isModalActive = false;
                    });
        
    }

     private loadAllMembers() {
        this.userService.getAllMember().subscribe(members => { this.members = members; });
        
    }

    toggleModal() {
        this.isModalActive = !this.isModalActive;
        this.registerMemberForm.reset();
    }

    toggleTopupModal() {
        this.topupModalActive = !this.topupModalActive;
    }

    toggleUpdateModal() {
        this.updateModalActive = !this.updateModalActive;
        this.registerMemberForm.reset();
    }
  
    topupModal() {
        this.topupModalActive = true;
    }



    createMemberModal() {
        this.isModalActive = true;
    }

    deleteMember(_id: string) {
        console.log(_id);
        this.userService.deleteMember(_id).subscribe(() => this.loadAllMembers() )};

    updateMember(member: Member) {
        this.updateModalActive = true;
            this.registerMemberForm.patchValue({
             membername: _.get(member,'membername'),
             room: _.get(member,'room'),
             email: _.get(member,'email'),
             tel: _.get(member,'tel'),
             _id: _.get(member, '_id')
            });
            console.log(member);
        };
        
        onSubmitUpdate() {
            this.submitted = true;

            if(this.registerMemberForm.dirty){
                return;
            }

            this.userService.updateMember(
                this.registerMemberForm.value
            ).subscribe(
                data => {
                    console.log(data);
                    this.updateModalActive = false;
                    this.loadAllMembers();
                    this.alertService.success('Update Successful!' ,true);
                    console.log(this.registerMemberForm.value);
                },
                error => {
                    this.alertService.error(error);
                }

            )


    
        }
    }



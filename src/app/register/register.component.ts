import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { abort } from 'process';
import { User } from '../models/user';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})

export class RegisterComponent implements OnInit {

  username: String = null;
  password: String = null;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() { }

  addUser() {
    var user = new User();
    user.username = this.username;
    user.password = this.password;
    user.email = "-";
    this.userService.addUser(user).subscribe(() => { });
    this.router.navigateByUrl('/signin')
    alert("User created succesfully");
  }

}
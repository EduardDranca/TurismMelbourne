import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  constructor(private userService: UserService, private router: Router) { }

  username: String = "";
  password: String = "";

  ngOnInit(): void { }

  signIn() {
    this.userService.signInUser(this.username, this.password).subscribe(val => {
      if (val.length === 1) {
        console.log(val);
        localStorage.setItem("userId", val[0].id);
        this.router.navigateByUrl('/map');
      } else {
        alert("Username or password incorrect")
      }
    });
  }

}

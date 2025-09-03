const userPopupHTMLData: string = `
                    <div class="tabs">
                        <div class="tab active" data-tab="login">Login</div>
                        <div class="tab" data-tab="register">Register</div>
                        <div class="tab-indicator"></div>
                    </div>

                    <div class="form-container">
                        <div class="form login">
                            <div class="input-group">
                                <input id="login-username" type="text" class="input" placeholder="Username" required>
                            </div>
                            <div class="input-group">
                                <input id="login-password" type="password" class="input" placeholder="Password" required>
                            </div>
                            <button id="login-btn" type="submit" class="btn">Login</button>
                          </div>

                        <div class="form register">
                            <div class="input-group">
                                <input id="register-username" type="text" class="input" placeholder="Username" required>
                            </div>
                            <div class="input-group">
                                <input id="register-password" type="password" class="input" placeholder="Password" required>
                            </div>
                            <button id="register-btn" type="submit" class="btn">Register</button>
                          </div>
                    </div>
`

export {userPopupHTMLData}
// theories hub data
// Restored theories hub (PR-I). Render-only; page shell keeps SEO meta.
window.__THEORY_GROUPS = [
      {
        label: "You can't teach size",
        items: [
          { name: "You can't teach size", href: "./size.html", pill: "In model", cls: "num",
            cuts: ["What people say: You cannot teach height, length, or strength. Take the bigger guy.", "What we found: Height, weight, wingspan, reach, and size at the position all move the odds. Draft slot is not in this check."] }
        ]
      },
      {
        label: "Tall guys who can dribble are rare",
        items: [
          { name: "Tall guys who can dribble are rare", href: "./handle.html", pill: "In model", cls: "num",
            cuts: ["What people say: A 6-foot-8 player who can pass and handle is the hardest thing to find.", "What we found: At the same height, the passers become All-Stars more often. 6-7 and up: 15% vs 11%. Under 6-5: 25% vs 5%. Draft slot is not in this check."] }
        ]
      },
      {
        label: "Workout numbers do not mean much",
        kind: "look",
        items: [
          { name: "Workout numbers do not mean much", href: "./combine.html", pill: "Looked at", cls: "na",
            cuts: ["What people say: The lane agility drill and the bench press do not tell you who can play.", "What we found: A table. Not a player score. Combine numbers are not in the GLM."] }
        ]
      },
      {
        label: "Drafting younger is better",
        items: [
          { name: "They last longer", href: "./age.html", pill: "In model", cls: "num",
            cuts: ["What people say: A 19-year-old has more years to get good than a 22-year-old.", "What we found: True. Under 19.5 lasts 10.4 years. 22.5 and older: 5.3. Draft slot is not in this check."] },
          { name: "They become stars more often", href: "./age.html", pill: "In model", cls: "num",
            cuts: ["What people say: Younger guys develop into All-Stars more often.", "What we found: True. Under 19.5: 26% All-Star. 22.5 and older: 12%. Class year is this theory, not a second lever. Draft slot is not in this check."] }
        ]
      },
      {
        label: "Past performance predicts future performance",
        items: [
          { name: "College stats tell you who will be good", href: "./prod.html", pill: "In model", cls: "num",
            cuts: ["What people say: If he scored a lot in college, he will score in the NBA.", "What we found: Points and assists are in the player score. Blocks are in too, capped at 2.0 for honors so a 4-block night is not 4 All-Stars."] },
          { name: "Guys who get fouled a lot can get to the rim", href: "./ftrate.html", pill: "Looked at", cls: "na",
            cuts: ["What people say: Drawing fouls is the honest version of being able to drive.", "What we found: A table. Free-throw rate is not a GLM feature."] },
          { name: "Taking a lot of threes matters more than a hot percentage", href: "./three.html", pill: "Looked at", cls: "na",
            cuts: ["What people say: Volume and the shot diet matter. A small-sample percentage does not.", "What we found: A table. Three-point volume is not a GLM feature."] },
          { name: "Passing travels better than scoring", href: "./astu.html", pill: "In model", cls: "num",
            cuts: ["What people say: Assist-to-usage is the smart way to measure a creator. Raw assists lie.", "What we found: Raw assists and the tall-passer flag are in the player score. The fancy ratio is not."] },
          { name: "College defense does not tell you anything", href: "./defense.html", pill: "In model", cls: "num",
            cuts: ["What people say: You cannot see NBA defense in college stats. Scoring is what boards overweight.", "What we found: Steals are in the player score, capped at 2.5. They do not feed Hall."] },
          { name: "You still need a big who can block shots", href: "./rim.html", pill: "In model", cls: "num",
            cuts: ["What people say: A defense without a rim protector leaks at the basket.", "What we found: Blocks are in the player score, capped at 2.0 for honors. Eddie Griffin 4.4 becomes 2.0. Uncapped he was 3.3 All-Stars. Zeroed, Shaq dies. We cap."] },
          { name: "Great shooters stay shooters", href: "./shoot.html", pill: "In model", cls: "num",
            cuts: ["What people say: A great shooter in high school is a great shooter in college and in the NBA. You do not teach that later.", "What we found: College FT% keeps its rank in the NBA. 85%+ stay at 83%. Under 65% stay at 63%. All-Star rate barely moves (13.8% vs 11.4%). The shot sticks. Stardom does not. Draft slot is not in this check."] },
          { name: "Elite high school players overcome a bad college year", href: "./hselite.html", pill: "In model", cls: "num",
            cuts: ["What people say: A McDonald's All-American who has a quiet college season is still a pro. The high school tape is the talent.", "What we found: McDonald's AA draftees are All-Stars 17% of the time vs 10% for everyone else. With no college scoring line the gap is 12.5% vs 7.3%. A modest college year barely moves it (10.3% vs 8.7%), so college points still own that residual. Pre-1977 is missing. High school points are not college points. Draft slot is not in this check."] },
        ]
      },
      {
        label: "School, country, and team",
        items: [
          { name: "The best players come from the best colleges", href: "./schools.html", pill: "Looked at", cls: "na",
            cuts: ["What people say: Duke, Kentucky, and the other blue bloods concentrate future stars.", "What we found: A table. School is not a GLM feature. Once you know the pick, blue bloods are ordinary. We do not use the pick."] },
          { name: "A pro line is not a college line", href: "./intl.html", pill: "In model", cls: "num",
            cuts: ["What people say: Overseas stats are noise next to college stats. Or they are the same points per game.", "What we found: 10 points against men is not 10 points in the NCAA. International lines are kept and centered on a typical pro line (10 / 2 / 1 / 0.8), not a college line."] },
          { name: "The team that drafts him matters as much as the player", href: "./develop.html", pill: "Looked at", cls: "na",
            cuts: ["What people say: Put him in the right program and he becomes a star. Put him in the wrong one and he dies.", "What we found: A table. Team logo is not a GLM feature."] },
          { name: "Leave a raw foreign player overseas until he is ready", href: "./stash.html", pill: "Looked at", cls: "na",
            cuts: ["What people say: Stashing a young big in Europe cuts the risk that he is not ready.", "What we found: A table. Stash is not a GLM feature."] }
        ]
      },
      {
        label: "Disproven",
        kind: "dead",
        items: [
          { name: "Older guys have a higher floor", href: "./disproven.html", pill: "Disproven", cls: "dead",
            cuts: ["What people say: A 22-year-old is ready now. Safer. Higher floor. Fewer busts.", "What we found: They last fewer years (5.3 vs 10.4), stick 3+ years less often (63% vs 89%), play fewer games per year (43 vs 51), and put up fewer win shares per year (1.22 vs 2.99). Draft slot is not in this check. It is not in the player model."] },
          { name: "Some players get good late, and teams miss them", href: "./late.html", pill: "Disproven", cls: "dead",
            cuts: ["What people say: Older college stars are cheap because everyone is obsessed with freshmen.", "What we found: They do not. This was a pick story. It is not in the player model."] },
          { name: "Getting better in year two means more than a huge freshman year", href: "./jump.html", pill: "Disproven", cls: "dead",
            cuts: ["What people say: A real leap as a sophomore is a better sign than one flashy freshman season.", "What we found: No. Freshman flashes still win. It is not in the player model."] }
        ]
      },
      {
        label: "Arguments we cannot check yet",
        kind: "qual",
        items: [
          { name: "Guarding every position matters more than blocking shots", href: "./switch.html", pill: "Not yet", cls: "na",
            cuts: ["What people say: In a switch-everything league, a big who can guard wings is worth more than a rim protector.", "What we found: We do not have a pre-draft switch tag. The opposite claim, that you still need a shot-blocker, is checked on the rim page."] },
          { name: "Tournament games show you who is clutch", href: "./march.html", pill: "Not yet", cls: "na",
            cuts: ["What people say: March tells you what the regular season hid.", "What we found: We do not have a player-matched NCAA tournament box to test this."] },
          { name: "He only works in our system", href: "./scheme.html", pill: "Not yet", cls: "na",
            cuts: ["What people say: A lot of reaches are fit calls, not talent errors.", "What we found: We do not have a draft-night scheme tag for each pick."] },
          { name: "Hidden injuries change everything", href: "./medical.html", pill: "Not yet", cls: "na",
            cuts: ["What people say: Front offices see the MRI. Public boards do not.", "What we found: There is no public imaging series, so we cannot score this."] },
          { name: "Off-court warning signs predict busts", href: "./character.html", pill: "Not yet", cls: "na",
            cuts: ["What people say: Makeup red flags move a board even when the talent is real.", "What we found: There is no public character-flag list and no shared definition of a bust."] },
          { name: "He plays harder than everyone else", pill: "Not yet", cls: "na",
            cuts: ["What people say: Motor, competing on every trip, is the thing film people will not give up.", "What we found: Effort is real. It is also not in any public table we can score."] },
          { name: "He just knows where to be", pill: "Not yet", cls: "na",
            cuts: ["What people say: Feel and basketball IQ separate players who last from athletes who wash out.", "What we found: No public IQ series. Closest checked signals are passing and age."] },
          { name: "Always take the best player, not the one you need", pill: "Not yet", cls: "na",
            cuts: ["What people say: Drafting for a hole on tonight's roster is how you miss stars.", "What we found: We can see who got picked. We cannot yet tag whether the team was reaching for need."] },
          { name: "The listed height is the real height", pill: "Not yet", cls: "na",
            cuts: ["What people say: Trust the media-guide number. That is how tall he is.", "What we found: We do not have listed height and combine height on the same players yet, so this stays here until that file exists."] },
          { name: "He can keep the weight on", pill: "Not yet", cls: "na",
            cuts: ["What people say: Some guys play at their listed weight. Some show up to camp 15 pounds light and stay that way.", "What we found: One combine weigh-in next to a media-guide number is not the same thing. We do not have a year-to-year playing-weight series."] }
        ]
      }
    ];
